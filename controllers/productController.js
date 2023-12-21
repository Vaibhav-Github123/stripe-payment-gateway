const Product = require("../model/product");
const Cart = require("../model/cart");

exports.AddProduct = async (req, res) => {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    try {
        const {product_name, price, category} = req.body

        // let downpayment = parseFloat(price * 0.30)

        const product = await stripe.products.create({
            name: product_name,
            default_price_data: {
              unit_amount: price * 100,
              currency: 'INR',
              recurring: {
                interval: 'month',
              },
            },
            expand: ['default_price'],
          });

          // let restamount = parseFloat((price - downpayment) / 3).toFixed(2)
          // restamount = Math.round(restamount)
          let restamount = parseFloat(price * 11)

        const Prodprice = await stripe.prices.create({
          unit_amount: restamount * 100,
          currency: "INR",
          recurring: {interval: 'year'},
          product: product.id,
        });

       const data = new Product({
            product_name: product_name,
            price: price,
            category: category,
            product_id: product.id,
            downpayment_price_id: product.default_price.id,
            restamount_price_id: Prodprice.id
        });
        await data.save()
        res.json(data);
    } catch (error) {
        return res.status(500).json({
            message: error.message,
          });
    }
};

exports.productPage = async (req, res) => {
    try {
        const product = await Product.findAll()
        res.render('product',{products: product})
    } catch (error) {
        return res.status(500).json({
            message: error.message,
          });
    }
};

exports.AddToCart = async (req, res) => {
    try {
        const {product_name, price, category, product_quantity} = req.body

       const product = new Cart({
        product_name: product_name,
            price: price,
            category: category,
            product_quantity: product_quantity,
        });
        await product.save()
        res.send({
            status: true,
            data: product,
            message: "Product has been successfully added to the cart.",
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
          });
    }
}

exports.getCartPage = async (req,res) =>{
    try {
        const cartproduct = await Cart.findAll()
        res.render('cart',{
            carts: cartproduct
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message,
          });
    }
}

exports.deleteProd = async (req, res) =>{ 
    try {
        const id = req.params.id;

    const productDel = await Cart.destroy({ where: { id },force: true});
    if (productDel) {
      res.redirect("/cartpage");
    }
    } catch (error) {
        return res.status(500).json({
            message: error.message,
          });
    }
}

exports.OneTimePaymetStarip = async (req, res) =>{
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    try {
        const amount = req.body.total_price*100
        const product_name = req.body.productName
        const session = await stripe.checkout.sessions.create({
            payment_method_types:['card'],
            line_items: [ 
                { 
                  price_data: { 
                    currency: "INR", 
                    product_data: { 
                      name: product_name, 
                    }, 
                    unit_amount: amount, 
                  }, 
                  quantity: '1', 
                }, 
              ], 
             // line_items: [{
             //     name:'vaibhav',
             //     amount: 300*100,
             //     quantity: Tquantity
             // }],
            mode: 'payment',
            success_url:"http://localhost:9000/remover-cart?transaction_id={CHECKOUT_SESSION_ID}",
            cancel_url:"http://localhost:9000/cancle-paymet"
        });
        
          res.send(session.url);
        
    } catch (error) {
        return res.status(500).json({
            message: error.message,
          });
    }
}


exports.RecurringPayment = async (req, res) => {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    try {

        const product = await Product.findOne({
            where:{
                product_name: req.body.productName
            }
        })
  
    const session = await stripe.checkout.sessions.create({
      billing_address_collection: 'auto',
      line_items: [
        {
          price: product.downpayment_price_id,
          quantity: 1,
  
        },
      ],
      mode: 'subscription',
      success_url:"https://1d04-110-227-230-88.ngrok-free.app/success-paymet?transaction_id={CHECKOUT_SESSION_ID}",
      cancel_url:"https://1d04-110-227-230-88.ngrok-free.app/cancle-paymet"
    });

     let transaction_id = session.id
     product.tranction_price_id = transaction_id
     await product.save()

   

    res.send(session.url);
  } catch (error) {
    console.log(error);
    console.log(error.message);
    return res.status(500).json({
      message: error.message,
    });
  }
  };

  exports.BillingPortal = async (req, res) => {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    try {
    const  session_id  = req.query.session_id;
    // const  session_id  = "cs_test_a1boDuxMqWybINlYRrGcaeEbd2C2beSjFI2f7alOB31Jaw5AusY1gzE702"
    const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);
    const returnUrl = 'https://1d04-110-227-230-88.ngrok-free.app';

    
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: checkoutSession.customer,
      return_url: returnUrl,
    });

    // const subscriptionID = await stripe.subscription.retrieve(checkoutSession.subscription);
    // const  subscriptionID =  checkoutSession.subscription



      // const session = await stripe.billingPortal.sessions.create({
      //   customer: checkoutSession.customer,
      //   return_url: returnUrl,
      //   flow_data: {
      //     type: 'subscription_update',
      //     subscription_update: {
      //       subscription: checkoutSession.subscription,
      //     },
      //   },
      // });


    res.redirect(portalSession.url);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
  };

  // exports.webhook = async (request, response) => {
  //   try {
  //     const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  //     let event;
  //     let data;
  //     let product;
  //     // at https://dashboard.stripe.com/webhooks
  //     const endpointSecret = 'whsec_CVqvFh9wcVkHq1pAhdd41pJe5Pkwp1g5';
  //     if (endpointSecret) {
  //         const signature = request.headers['stripe-signature'];
  //         const rawBody = request.body;
  //       try {
  //         event = stripe.webhooks.constructEvent(
  //           rawBody,
  //           signature,
  //           endpointSecret
  //         );
  //       } catch (err) {
  //         console.log(`Webhook signature verification failed.`, err.message);
  //         return response.sendStatus(400);
  //       }
  //       data = event.data;
  //       eventType = event.type;

  //       product = await Product.findOne({
  //         where:{
  //           tranction_price_id: data.object.id
  //         }
  //     })

  //     }else{
  //       data = req.body.data;
  //       eventType = req.body.type;
  //     }

  //     if(data.object.subscription){
  //     if(eventType === "checkout.session.completed"){
  //       const checkoutSession = data.object;
  //       const schedule = await stripe.subscriptionSchedules.create({
  //         from_subscription: checkoutSession.subscription,
  //       })
  //       console.log(`schedule: ${schedule.id}`);
  //       const phases = schedule.phases.map(phase => ({
  //         start_date: phase.start_date,
  //         end_date: phase.end_date,
  //         items: phase.items
  //       }))
    
  //       console.log({ phases });
    
  //       const updatedSchedule = await stripe.subscriptionSchedules.update(
  //         schedule.id,
  //         {
  //           end_behavior: "cancel",
  //           phases:[
  //             ...phases,
  //             {
  //               items:[{
  //                 price: product.restamount_price_id,
  //                 quantity:1,
  //               }],
  //               iterations:3
  //             }
  //           ]
  //         }
  //       )
  //       console.log({updatedSchedule})
  //     }
  //   }
        
  //     response.status(200).json({success: true})
  //   } catch (error) {
  //       return response.status(500).json({
  //           message: error.message,
  //         });
  //   }
  //   };

exports.ProdSuccessPaymet = async function(req,res){
try {
  const session_id = req.query.transaction_id
  // const session_id = "cs_test_a1boDuxMqWybINlYRrGcaeEbd2C2beSjFI2f7alOB31Jaw5AusY1gzE702"
  res.render('success',{
    sessionid: session_id
  })
  const cartdatas = await Cart.findAll({force: true});

    for (const cartdata of cartdatas ){
        await cartdata.destroy();
    }
} catch (error) {
    return res.status(500).json({
        message: error.message,
      });
}
}

exports.ProdCanclePaymet = async function(req,res){
    try {
        res.render('cancle')
    } catch (error) {
        return res.status(500).json({
            message: error.message,
          });
    }
}

exports.ProdRemoverCart = async function(req,res){
    try {
        const cartdatas = await Cart.findAll({force: true});

        for (const cartdata of cartdatas ){
            await cartdata.destroy();
        }
        res.redirect('/success-paymet')
    } catch (error) {
        return res.status(500).json({
            message: error.message,
          });
    }
}