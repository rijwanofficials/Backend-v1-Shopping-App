const express = require("express");
const { sendOtpController } = require("./controller");
const otpRouter = express.Router();
otpRouter.post("/", sendOtpController);
module.exports = { otpRouter };
