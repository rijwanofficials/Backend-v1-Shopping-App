const express = require("express");
const { validateOtpMiddleware } = require("./middleware");
const { sendOtpController } = require("./controller");
const otpRouter = express.Router();
otpRouter.post("/", sendOtpController ,validateOtpMiddleware);
module.exports = { otpRouter };
