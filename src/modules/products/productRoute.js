const express =  require('express');
const router = express.Router();

const {authenticateToken} = require("./../middleware/authenticate");
const productController = require("./productController");

router.post('/create-product', authenticateToken, productController.createProduct)
router.patch('/update-product/:id', authenticateToken, productController.updateProduct)
router.patch('/change-product-status/:id', authenticateToken, productController.updateProductStatus)
router.delete('/delete-product/:id', authenticateToken, productController.deleteProduct);



module.exports = router;