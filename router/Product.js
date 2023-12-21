const express = require("express");
const router = express.Router();

const ProductController = require("../controllers/productController");

router.post("/add", ProductController.AddProduct);

router.get('/', ProductController.productPage)

router.post('/addtocart', ProductController.AddToCart)

router.get('/cartpage', ProductController.getCartPage)

router.get('/delete-prod/:id',ProductController.deleteProd)

router.post('/paymet-starip',ProductController.OneTimePaymetStarip)

router.post('/create-checkout-session',ProductController.RecurringPayment)

router.get('/success-paymet',ProductController.ProdSuccessPaymet)

router.post('/create-portal-session',ProductController.BillingPortal)

// router.post('/webhook',ProductController.webhook)

router.get('/cancle-paymet',ProductController.ProdCanclePaymet)

router.get('/remover-cart',ProductController.ProdRemoverCart)
module.exports = router;
