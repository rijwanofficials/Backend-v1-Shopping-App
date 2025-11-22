const { customAlphabet } = require("nanoid");
const nanoid = customAlphabet("1234567890", 6);
const { sendEmail } = require("../../../utils/emailHelper");
const { otpModel } = require("../../../models/otpSchema");

const sendOtpController = async (req, res) => {
    try {
        console.log("---Inside sendOtpController---");
        let { email } = req.body;

        if (!email) {
            return res.status(400).json({
                isSuccess: false,
                message: "Email is required",
            });
        }

        email = email.trim().toLowerCase();

        const otp = nanoid();

        console.log("Generated OTP:", otp);
        const otpRecord = await otpModel.create({
            email,
            otp,
            expiresAt: Date.now() + 10 * 60 * 1000,
        });

        const htmlBody = `
      <div style="font-family: Arial; padding: 20px; text-align: center;">
        <h2>Your OTP Code</h2>
        <h1>${otp}</h1>
        <p>This OTP is valid for 10 minutes.</p>
      </div>
    `
        const emailStatus = await sendEmail(email, "Your OTP Code", htmlBody);

        if (!emailStatus.isSuccess) {
            console.error("Email sending failed:", emailStatus.message);
            return res.status(500).json({
                isSuccess: false,
                message: "OTP generated but failed to send email",
                error: emailStatus.message,
                details: emailStatus.details || null,
            });
        }


        console.log("Email send status:", emailStatus);
        console.log("otpId", otpRecord._id);
        return res.status(200).json({
            isSuccess: true,
            message: "OTP sent to your email",
            otpId: otpRecord._id,
            expiresAt: otpRecord.expiresAt,
        });


    } catch (err) {
        console.error("---Error in sendOtpController---", err.message);
        return res.status(500).json({
            isSuccess: false,
            message: "Server error while sending OTP",
            error: err.message,
        });
    }
};

module.exports = { sendOtpController };
