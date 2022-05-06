const {UserRoles,ProductStatus} = require("../../helper/enums");
const orderRepository = require("./orderRepository");
const productRepository = require("./../products/productRepository")
const userRepository = require("./../users/userRepository")

const createOrder = async (data) => {
    try {
        const {productIds, userId} = data;
        let totalPrice = 0;
    
        for(productId of productIds){
            const product = await productRepository.getProductDetailsById(productId);
            if(product.rows.length == 0){
                return {
                    data: null,
                    error: "Product doesnot exists!"
                }
            }
            if(product.rows[0].status != ProductStatus.ACTIVE){
                return {
                    data: null,
                    error: "Product is not active"
                }
            }
            totalPrice += product.rows[0].price;
            
        }
        data.price = totalPrice;
    
        await orderRepository.createOrder(data)

        return {
            data: 1,
            error: null
        }

    }catch (err){
        return {
            data: null,
            error: err.message
        }
    }


}

const updateOrderStatus = async(data) => {
    const {orderId, userId} = data;
    const {rows} = await userRepository.roleCheckHelper(userId);
    const isAdmin = rows[0].roles == UserRoles.ADMIN;
    const isOrderValid = await orderRepository.orderExists(orderId) != null;

    console.log(isOrderValid);

    if(!isOrderValid) {
        return {
            data: null,
            error: "Order doesnot exists!"
        }
    }
    else if(isAdmin) {
        await orderRepository.updateOrderStatusByAdmin(data);
        return {
            data: 1,
            error: null
        }
    } else {
        return {
            data: null,
            error: "Unauthorized user!"
        }
    }
}

module.exports = {
    createOrder,
    updateOrderStatus
}