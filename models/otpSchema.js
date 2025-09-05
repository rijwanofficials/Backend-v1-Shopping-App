const mongoose = require("mongoose");
const bcrypt = require('bcrypt');


const { Schema, model } = mongoose;

const otpSchema = new Schema({
    email: {
        type: String,
        required: true,
        trim: true
    },
    otp: {
        type: String,
        required: true,
        trim: true
    }

}, {
    timestamps: true,
    versionKey: false,
});


// -------------Default Preferences----------
otpSchema.pre("findOneAndUpdate", function () {
    this.setOptions({
        runValidators: true,
        new: true
    });
});
otpSchema.pre("updateOne", function () {
    this.setOptions({
        runValidators: true,
        new: true
    });
});
otpSchema.pre("UpdateMany", function () {
    this.setOptions({
        runValidators: true,
        new: true
    });
});

otpSchema.pre("save", async function (next) {
    if (this.isModified("otp")) {
        this.otp = await bcrypt.hash(this.otp.toString(), 12);  // hash OTP
    }
    next();
});




const otpModel = model("otp", otpSchema);

module.exports = { otpModel };
