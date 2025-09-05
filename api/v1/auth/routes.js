const express = require("express");
const { usersignupController, userloginController, userlogoutController } = require("./controller");
const { validateOtpMiddleware } = require("../otp/middleware");
const { userloginValidator, usersignupValidator } = require("./dto");


const signupRouter = express.Router();
signupRouter.post("/signup", usersignupValidator, validateOtpMiddleware, usersignupController);
signupRouter.post("/login", userloginValidator, userloginController);
signupRouter.get("/logout", userlogoutController);

module.exports = { signupRouter };
