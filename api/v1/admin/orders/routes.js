const express = require("express");
const { getAllOrdersController } = require("./controller");

const adminOrdersRouter = express.Router();

adminOrdersRouter.get("/", getAllOrdersController);
module.exports = { adminOrdersRouter };
