const { customAlphabet } = require('nanoid');
const nanoid = customAlphabet('123456789', 4)

const { otpModel } = require("../../../models/otpSchema");
const { sendOtpEmail } = require('../../../utils/emailHelper');

const sendOtpController = async (req, res) => {
    try {
        console.log("<-----Inside the sendOtpController------>");
        const { email } = req.body;
        const otp = nanoid();
        sendOtpEmail(email, otp);
        await otpModel.create({
            email, otp
        });
        res.status(201).json({
            isSuccess: true,
            message: "Otp sent!"
        })
    }
    catch (err) {
        console.log("<-----Error In sendOtpController------>", err.message);
        res.status(500).json({
            isSuccess: false,
            message: "Internal Server Error",
            data: {}
        });
    }
}

module.exports = { sendOtpController }