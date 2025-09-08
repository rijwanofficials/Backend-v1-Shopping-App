const express = require("express");
const { validateUsersLoggedInMiddleware } = require("../middleware");
const { placeOrderVallidator } = require("./dto");
const { placeOrderController } = require("./controller");

const orderRouter = express.Router();
module.exports = { orderRouter };

orderRouter.post("/", validateUsersLoggedInMiddleware, placeOrderVallidator, placeOrderController);
