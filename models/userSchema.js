const mongoose = require("mongoose");
const bcrypt = require('bcrypt');


const { Schema, model } = mongoose;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"]

    }, password: {
        type: String,
        required: true,
        trim: true,
        minlength: 6,
        match: [
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            "Password must have 8+ chars, 1 uppercase, 1 lowercase, 1 number, and 1 special character"
        ]
    }, name: {
        type: String,

    }, DOB: {
        type: String,
    }, profilePhoto: {
        type: String,
    },
    address: [
        {
            local: String,
            city: String,
            state: String,
            pincode: String,
            country: String,
            phoneNumber: String
        }
    ],
    isProfileComplete: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true,
    versionKey: false,
});


// -------------Default Preferences----------
userSchema.pre("findOneAndUpdate", function () {
    this.setOptions({
        runValidators: true,
        new: true
    });
});
userSchema.pre("updateOne", function () {
    this.setOptions({
        runValidators: true,
        new: true
    });
});
userSchema.pre("UpdateMany", function () {
    this.setOptions({
        runValidators: true,
        new: true
    });
});

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password.toString(), 12);
    }
    next();
});




const UserModel = model("user", userSchema);

module.exports = { UserModel };
