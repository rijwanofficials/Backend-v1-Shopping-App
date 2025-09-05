const express = require("express");
const { addToCartValidator } = require("./dto");
const { addToCartController, getCartItemController } = require("./controller");
const { validateUsersLoggedInMiddleware } = require("../middleware");

const cartRouter = express.Router();
module.exports = { cartRouter };

cartRouter.get("/", validateUsersLoggedInMiddleware, getCartItemController);
cartRouter.post("/:productId", validateUsersLoggedInMiddleware, addToCartValidator, addToCartController);