const pool = require("../../config/dbConfig");
const { ProductStatus } = require("../../helper/enums");

const productExists = async(productId) => {
    return pool.query("SELECT p FROM project.product p WHERE id = $1", [productId]) != null;
}
const getProductDetailsById = async(productId) => {
    return await pool.query(
        `select status,price from project.product where id = $1`,[productId]
    )
}
const updateProductStatus = async(productStatus, productId) => {
    await pool.query("UPDATE project.product SET status = $1 where id = $2", [productStatus, productId]);
}

const createNewProduct = async(product) => {
    const {title, pictureUrl, status, price, userId} = product;

    await pool.query(
        "INSERT INTO project.product (status, title, pictureurl, price, createdby) VALUES($1,$2,$3,$4,$5)",
        [
          status,
          title,
          pictureUrl,
          price,
          userId,
        ]
      );
}

const getProductById = async(id) => {
    return await pool.query(
        `select title,pictureurl,price from project.product where id = $1`,[id]
    );
    
}

const updateProductById = async(product) => {
    const { title, pictureUrl, price, productId } = product;
    
    await pool.query("UPDATE project.product SET title = $1, pictureurl = $2, price = $3 where id = $4", 
    [title, pictureUrl, price, productId]);
}

const deleteProductById = async(productId) => {
    await pool.query("DELETE FROM project.product WHERE id = $1", [productId]);
}

module.exports = {
    createNewProduct,
    updateProductById,
    getProductById,
    productExists,
    updateProductStatus,
    deleteProductById,
    getProductDetailsById

}