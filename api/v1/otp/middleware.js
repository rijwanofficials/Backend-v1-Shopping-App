const { otpModel } = require("../../../models/otpSchema");
const bcrypt = require("bcrypt");
const validateOtpMiddleware = async (req, res, next) => {
    try {
        console.log("<-----Inside validateOtpMiddleware------>");
        const { email, otp } = req.body;
        // validate otp 
        const otpDoc = await otpModel.findOne().where("email").equals(email).sort("-createdAt");
        if (otpDoc == null) {
            res.status(400).json({
                isSuccess: false,
                message: "otp not found please resend the otp to this email!",
            });
            return;
        }

        const { otp: hashedOtp } = otpDoc;
        const isCorrect = await bcrypt.compare(otp.toString(), hashedOtp);

        if (!isCorrect) {
            res.status(400).json({
                isSuccess: false,
                message: "otp is not matched!",
            });
            // have some logic for the maxtry attempt that a user can do
            // whenever there is error increase attemp count
            // aftet the threshold limit get reached block the activity
            // for few hrs
            return;
        }
        next();
        // if otp is correct call the next
        // else send error response
    } catch (err) {
        console.log("<-----Error In validateOtpMiddleware------>", err);
        res.status(500).json({
            isSuccess: false,
            message: "Internal Server Error",
            data: {}
        });
    }
};
module.exports = { validateOtpMiddleware };