const express = require("express");
// PProduct Controller
const { editProductController,
    getAllProductController,
    createProductController,
    deleteProductController,
    listProductController,
    viewProductController,
    getFilteredProductsController
} = require("./controllers");

// Product Validator
const { createProductValidator, updateProductValidator, viewProductValidator, listProductValidator } = require("./dto");
const { validateUsersLoggedInMiddleware } = require("../middleware");
const { embedAllProducts } = require("./controllers");

const productRouter = express.Router();

productRouter.post("/", createProductValidator, createProductController);

productRouter.get("/", listProductValidator, listProductController);

productRouter.get("/all", validateUsersLoggedInMiddleware, getAllProductController);

productRouter.patch('/:id', validateUsersLoggedInMiddleware, updateProductValidator, editProductController);

productRouter.delete('/:id', validateUsersLoggedInMiddleware, deleteProductController);


productRouter.get('/view/:id', viewProductValidator, viewProductController);

productRouter.get("/filter", getFilteredProductsController);

productRouter.post("/embed", embedAllProducts);


module.exports = { productRouter };



