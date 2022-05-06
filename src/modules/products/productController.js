const productService = require("./productService");

const createProduct = async (req, res) => {
    try{
        const { title,pictureUrl,price } = req.body;
        let productData = {
            title: title,
            pictureUrl: pictureUrl,
            price: price,
            userId: req.user.userId,
        };
        const response = await productService.createProduct(productData);
        const {error} = response;
        if(error) {
            throw error;
        }
        res.status(201).json({
            success: 1,
            message: "Product created successfully"
        });
    } catch (err) {
        console.log(err.message);
        res.status(500).json({
            success: 0,
            error: err?.message || err
        });
    }

};

const updateProduct = async (req, res) => {

    try {

        let data = {
            productId: req.params.id,
            title: req.body.title,
            pictureUrl: req.body.pictureUrl,
            price: req.body.price,
            userId : req.user.userId
        };
        //console.log(data)
        const resposne = await productService.updateProduct(data);
        const {error} = resposne;
        if(error) {
            throw error;
        }
        res.status(200).json({
            success: 1,
            message: "Product updated successfully"
        });
    } catch (err) {
        console.log(err.message);
        res.status(500).json({
            success: 0,
            error: err
        });
    }
};

const updateProductStatus = async (req, res) => {

    try {
        let data = {};
        data.productStatus = req.body.status;
        data.productId = req.params.id;
        data.userId = req.user.userId;

        const response = await productService.updateProductStatus(data);
        const {error} = response;
        if(error) {
            throw error;
        }
        res.status(200).json({
            success: 1,
            message: "Product status updated successfully"
        });
    } catch (err) {
        console.log(err.message);
        res.status(500).json({
            success: 0,
            error: err
        });
    }
}

const deleteProduct = async (req, res) => {

    let data = {};
    data.productId = req.params.id;
    data.userId = req.user.userId;

    try {
        const {error} = await productService.deleteProduct(data);
        if(error) {
            throw error;
        }
        res.status(200).json({
            success: 1,
            message: "Product deleted successfully"
        });
    } catch (err) {
        console.log(err.message);
        res.status(400).json({
            success: 0,
            error: err
        });
    }
};


module.exports= {
    createProduct, 
    updateProduct,
    updateProductStatus,
    deleteProduct
}