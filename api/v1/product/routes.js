const express = require("express");
// PProduct Controller
const { editProductController,
    getAllProductController,
    createProductController,
    deleteProductController,
    listProductController,
    viewProductController
} = require("./controllers");

// Product Validator
const { createProductValidator, updateProductValidator, viewProductValidator } = require("./dto");
const { validateUsersLoggedInMiddleware } = require("../middleware");

const productRouter = express.Router();

productRouter.post("/", createProductValidator, createProductController);

// chaining middleware-------******
// productRouter.get("/", validateUsersLoggedInMiddleware, listProductController);

// router lavel middleware 
// productRouter.use(validateUsersLoggedInMiddleware)
// secured apis

productRouter.get("/", listProductController);


productRouter.get("/all", validateUsersLoggedInMiddleware, getAllProductController);

productRouter.patch('/:id', validateUsersLoggedInMiddleware, updateProductValidator, editProductController);

productRouter.delete('/:id', validateUsersLoggedInMiddleware, deleteProductController);


productRouter.get('/view/:id', viewProductValidator, viewProductController);


module.exports = { productRouter };
