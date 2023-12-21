require('dotenv').config();
require('./config/db');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const port = 9000
const sequelize = require('./config/db');
const Routers = require('./router/index');

(async function () {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        await sequelize.sync({ force: false });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();


app.use(['/webhook'], bodyParser.raw({ type: 'application/json' }))

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(express.json())

app.set("views", path.join(__dirname, "views"));
app.set('view engine', 'ejs')

// app.post( '/webhook',bodyParser.raw({ type: 'application/json' }), async (request, response) => {
//     const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
//       let event;

//       // at https://dashboard.stripe.com/webhooks
//       const endpointSecret = 'whsec_GjNiITo12R5mis9OlTyKZsqnbr7RmYMx';
//       if (endpointSecret) {
//           const signature = request.headers['stripe-signature'];
//           const rawBody = request.body;
//         try {
//           event = stripe.webhooks.constructEvent(
//             rawBody,
//             signature,
//             endpointSecret
//           );
//         } catch (err) {
//           console.log(`Webhook signature verification failed.`, err.message);
//           return response.sendStatus(400);
//         }
//         data = event.data;
//         eventType = event.type;
//       }else{
//         data = req.body.data;
//         eventType = req.body.type;
//       }

//       if(eventType === "checkout.session.completed"){
//         const checkoutSession = data.object;
//         const schedule = await stripe.subscriptionSchedules.create({
//           from_subscription: checkoutSession.subscription,
//         })
//         console.log(`schedule: ${schedule.id}`);
//         const phases = schedule.phases.map(phase => ({
//           start_date: phase.start_date,
//           end_date: phase.end_date,
//           items: phase.items
//         }))
    
//         console.log({ phases });
    
//         const updatedSchedule = await stripe.subscriptionSchedules.update(
//           schedule.id,
//           {
//             end_behavior: "cancel",
//             phases:[
//               ...phases,
//               {
//                 items:[{
//                   price:"price_1NhtArSAFxoFvZinNtBAhJP4",
//                   quantity:1,
//                 }],
//                 iterations:3
//               }
//             ]
//           }
//         )
//         console.log({updatedSchedule})
//       }
        
//       response.status(200).json({success: true})
//     });
    



app.use('/',Routers)


app.listen(port,()=>{
    console.log(`http://localhost:${port}`)
})