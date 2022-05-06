const router = require('express').Router();
const {authenticateToken} = require("./../middleware/authenticate");
const orderController = require("./orderController");

router.patch("/change-order-status/:id", authenticateToken, orderController.updateStatus);
router.post("/create-order", authenticateToken, orderController.createOrder)

module.exports = router;