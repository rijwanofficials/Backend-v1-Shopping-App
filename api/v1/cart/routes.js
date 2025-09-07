const express = require("express");
const { addToCartController, getCartItemController, removeItemFromCartController } = require("./controller");
const { updateItemCartController } = require("./dto");
const { validateUsersLoggedInMiddleware } = require("../middleware");

const cartRouter = express.Router();
module.exports = { cartRouter };

cartRouter.get("/", validateUsersLoggedInMiddleware, getCartItemController);
cartRouter.post("/:productId/add",
    validateUsersLoggedInMiddleware,
    updateItemCartController,
    addToCartController);
cartRouter.post("/:productId/remove",
    validateUsersLoggedInMiddleware,
    updateItemCartController,
    removeItemFromCartController
);