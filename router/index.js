const express = require("express")
const router = express.Router()

const ProductRouter = require("../router/Product")

router.use("/",ProductRouter)

module.exports = router
