const express = require("express");
const { validateUsersLoggedInMiddleware, validateIsAdminMiddleware } = require("../middleware");
const { sendAdminInfoController } = require("./controller");
const { adminOrdersRouter } = require("./orders/routes");

const adminRouter = express.Router();

adminRouter.use(validateUsersLoggedInMiddleware);
adminRouter.use(validateIsAdminMiddleware);
adminRouter.get("/me", sendAdminInfoController);
adminRouter.use("/orders", adminOrdersRouter);

module.exports = { adminRouter };
