// sending EMAIL
const nodemailer = require("nodemailer");

// Creating a test account.
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", //gmail
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});


// function for verifying wheather my email server is on or not
(async () => {
    try {
        await transporter.verify();
        console.log("-----✅ Email Server is ready to take our message----");
    }
    catch (err) {
        console.log("--------❌ Error Connecting Email server---------");
        console.log(err.message);
    }
})(); //IIFE=Imidate invoke func expression



// send email function
const sendEmail = (async (toEmail, subject, htmlText) => {
    try {
        console.log("----------Inside the sendEmail-------------"); await transporter.sendMail({
            from: `"Shopping App Verification Team" <${process.env.SMTP_USER}>`, //sender email
            to: toEmail, //receiver's email
            subject: subject,
            html: htmlText, // HTML body
        });
        console.log("---------Message sent-----------:");
    }
    catch (err) {
        console.log("------Error while sending email------");
        console.log(err.message);
        throw new Error("Email not sent");
    }
});

const sendOtpEmail = async (toEmail, otp) => {
    console.log("----------Inside the sendOtpEmail-------------");
    await sendEmail(
        toEmail,
        "Otp verification for Shopping App",
        `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <style>
      body {
        font-family: Arial, sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        margin: 0;
        background: #f9f9f9;
      }

      .container {
        border: 1px solid #ddd;
        border-radius: 10px;
        padding: 30px;
        text-align: center;
        background: #ffffff;
        width: 400px;
      }

      h1 {
        color: chocolate;
        font-size: 20px;
        margin-bottom: 1rem;
      }

      h2 {
        color: darkblue;
        font-size: 28px;
        margin: 0;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Your OTP for the verification of Email is:</h1>
      <h2>${otp}</h2>
    </div>
  </body>
</html>

`
    )
}


module.exports = { sendOtpEmail };