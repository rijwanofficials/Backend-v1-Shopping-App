const { Resend } = require("resend");

const resendApiKey = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (toEmail, subject, htmlText) => {
  try {
    const { data, error } = await resendApiKey.emails.send({
      from: "Verification@email.rijwan.me",
      to: toEmail,
      subject,
      html: htmlText,
    });
    if (error) {
      console.error("Error sending email:", error);
      return {
        isSuccess: false,
        message: "Failed to send email",
        error: error
      };
    }
    else {
      console.log("Email sent successfully:", data);
      return {
        isSuccess: true,
        message: "Email sent successfully",
        data: data
      };
    }
  } catch (err) {
    console.error("Email Exception:", err);
    return {
      isSuccess: false,
      message: "Failed to send email",
      error: err.message
    };
  }
};
module.exports = { sendEmail };
