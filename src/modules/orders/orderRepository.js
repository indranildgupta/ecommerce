
const pool = require("../../config/dbConfig");
const {OrderStatus} = require("../../helper/enums");

const createOrder = async (data) => {
    const { productIds, price, userId } = data;
    await pool.query(
        `insert into project.order (status,items,totalprice,createdBy) values($1,$2,$3,$4)`,
        [OrderStatus.ACTIVE,productIds,price,userId]
    )
}

const updateOrderStatusByAdmin = async(data) => {
    const {orderStatus, orderId} = data;
    console.log(orderStatus, orderId)
    await pool.query("UPDATE project.order SET status = $1 WHERE id = $2", [orderStatus, orderId]);
}

const orderExists = async(orderId) => {
    return pool.query("SELECT o FROM project.order o WHERE id = $1", [orderId]);
}

module.exports = {
    createOrder,
    updateOrderStatusByAdmin,
    orderExists
}
