const orderService = require("./orderService");

const createOrder = async(req, res) => {
    try{
        let orderData = {
            productIds : req.body.productIds,
            userId : req.user.userId
        }
        console.log(orderData);
        const response = await orderService.createOrder(orderData); 
        const {data, error} = response;

        if(error) {
            throw error;
        }

        res.status(200).json({
            success: 1,
            data,
            message: "Order created successfully"
        });
    } catch(err) {
        console.log(err.message);
        res.status(400).json({
            success: 0,
            error: err
        });
    }  
}

const updateStatus = async(req, res) => {

    let orderData = {};
    orderData.orderId = req.params.id;
    orderData.orderStatus = req.body.status;
    orderData.userId = req.user.userId;

    console.log("Updating order ...");
    console.log(orderData);

    try {
        const response = await orderService.updateOrderStatus(orderData); 
        const {data, error} = response;

        if(error) {
            throw error;
        }

        res.status(200).json({
            success: 1,
            data,
            message: "Order updated successfully"
        });
    } catch(err) {
        console.log(err.message);
        res.status(400).json({
            success: 0,
            error: err
        });
    }  
}

module.exports = {
    createOrder,
    updateStatus,
}