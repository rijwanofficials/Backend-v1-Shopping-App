const { customAlphabet } = require('nanoid');
const nanoid = customAlphabet('123456789', 4)

const { otpModel } = require("../../../models/otpSchema");
const { sendOtpEmail } = require('../../../utils/emailHelper');

const sendOtpController = async (req, res) => {
    try {
        console.log("<-----Inside the sendOtpController------>");
        const { email } = req.body;
        // check if the otp already sent\
        // if the otp is already sent and the createdAt is less than the current time-15 mins 
        // then only sent the new otp and delete the old otp from the DB
        // otherwise don't send the new otp send the res that the otp was already sent 


        const otp = nanoid();


        // send otp to the email
        sendOtpEmail(email, otp);


        // stor the otp in db 
        await otpModel.create({
            email, otp
        });
        // send success response
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