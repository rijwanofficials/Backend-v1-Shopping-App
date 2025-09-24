const express = require("express");
const { updateProductController } = require("./controller");
const { updateProductValidator } = require("./dto");


const adminProductsRouter = express.Router();

adminProductsRouter.patch("/:id", updateProductValidator, updateProductController);

module.exports = { adminProductsRouter };
