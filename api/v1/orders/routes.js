const express = require("express");
const { validateUsersLoggedInMiddleware } = require("../middleware");
const { placeOrderVallidator } = require("./dto");
const { placeOrderController, getUserOrdersController } = require("./controller");
const { createPaymentSessionController } = require("./services");

const orderRouter = express.Router();
module.exports = { orderRouter };

orderRouter.post("/payment-session", validateUsersLoggedInMiddleware, createPaymentSessionController);
orderRouter.post("/", validateUsersLoggedInMiddleware, placeOrderVallidator, placeOrderController);
orderRouter.get("/my-orders", validateUsersLoggedInMiddleware, getUserOrdersController);

