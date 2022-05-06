const productRepository = require("./productRepository");
const userRepository = require("./../users/userRepository");
const {UserRoles} = require("../../helper/enums");
const {ProductStatus} = require("../../helper/enums");
const {OrderStatus} = require("../../helper/enums");

const createProduct = async(productData) => {
    // TODO: Check that the product doesnot exits

    productData.status = ProductStatus.DRAFT;
    const {rows} = await userRepository.roleCheckHelper(productData.userId);
    const userRole = rows[0].roles;

    if(userRole == UserRoles.ADMIN || userRole == UserRoles.VENDOR) {
        await productRepository.createNewProduct(productData);
        return {
            data: 1,
            error: null
        }
    } else {
        return {
            data: null,
            error: "Unauthorized access! Cannot create a new product"
        }
    }
}

const updateProduct = async(productData) => {
    const {rows} = await userRepository.roleCheckHelper(productData.userId);
    const userRole = rows[0].roles;
    if(userRole == UserRoles.SHOPPER) {
        return {
            data: null,
            error: "Unauthorized access! Cannot update product"
        }
    }

    const currentProduct = await productRepository.getProductById(productData.productId);

    if(currentProduct.rowCount == 0) {
        return {
            data: null,
            error: "Product doesn't exists!"
        }
    } 

    if(productData.title == null)
        productData.title = currentProduct.rows[0].title;
    if(productData.pictureUrl == null)
        productData.pictureUrl = currentProduct.rows[0].pictureurl;
    if(productData.price == null)
        productData.price = currentProduct.rows[0].price;
    
    console.log(productData)
    await productRepository.updateProductById(productData);
    return {
        data: 1,
        error: null
    }
    
}

const updateProductStatus = async(data) => {
    const {userId, productId, productStatus} = data;
    
    const isValidProduct = productRepository.productExists(productId);
    if(!isValidProduct) {
        return {
            data: null,
            error: "Product doesn't exists!"
        }
    } 

    const {rows} = await userRepository.roleCheckHelper(userId);
    const userRole = rows[0].roles;

    if(userRole==UserRoles.VENDOR && productStatus==ProductStatus.READY_FOR_LISTING) {
        await productRepository.updateProductStatus(productStatus, productId);
        return {
            data: 1,
            error: null
        }
    } else if (userRole==UserRoles.ADMIN ) {
        await productRepository.updateProductStatus(productStatus, productId);
        return {
            data: 1,
            error: null
        }
    } else if(userRole==UserRoles.SHOPPER){
        return {
            data: null,
            error: "Unauthorized access! Cannot update product..."
        }
    } else {
        return {
            data: null,
            error: "Invalid Product status!!"
        }
    }

}

const deleteProduct = async(data) => {
    const {userId, productId} = data;
    const {rows} = await userRepository.roleCheckHelper(userId);
    const userRole = rows[0].roles;
    console.log(productId);
    if(userRole == UserRoles.ADMIN) {
        await productRepository.deleteProductById(productId);
        return {
            data: null,
            error: null
        }
    } else {
        return {
            data: null,
            error: "Unauthorized access! Cannot delete product.."
        }
        
    }
}

module.exports = {
    createProduct,
    updateProduct,
    updateProductStatus,
    deleteProduct,
}