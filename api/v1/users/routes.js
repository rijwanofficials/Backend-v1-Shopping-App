const express = require("express");
const { validateUsersLoggedInMiddleware } = require("../middleware");
const { sendsUserInfoControllers } = require("./controllers");

const usersRouter = express.Router();

usersRouter.use("/me", validateUsersLoggedInMiddleware, sendsUserInfoControllers);

module.exports = { usersRouter };
