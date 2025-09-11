const express = require("express");
const { validateUsersLoggedInMiddleware, validateIsAdminMiddleware } = require("../middleware");
const { sendAdminInfoController } = require("./controller");

const adminRouter = express.Router();

adminRouter.get("/me",validateUsersLoggedInMiddleware,validateIsAdminMiddleware,sendAdminInfoController)

module.exports = { adminRouter };
