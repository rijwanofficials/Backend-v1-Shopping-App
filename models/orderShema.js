const { ObjectId } = require('mongodb');
const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const orderSchema = new Schema({
    userId: {
        type: ObjectId,
        ref: "user",
        required: true
    },
    products: [
        {
            product: { type: ObjectId, ref: "product", required: true },
            cartQuantity: { type: Number, default: 1, min: 1 },
            price: { type: Number, required: true, min: 1 }
        }
    ],
    address: {
        fullName: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        country: { type: String, required: true, default: "India" }
    },
    orderStatus: {
        type: String,
        enum: ["pending", "confirmed", "shipped", "delivered", "canceled"],
        default: "pending"
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "completed", "failed", "refunded"],
        default: "pending"
    },
    paymentDetails: Object,
    paymentSessionId: String,
}, {
    timestamps: true,
    versionKey: false
});


// -------------Default Preferences----------
orderSchema.pre("findOneAndUpdate", function () {
    this.set({
        runValidators: true,
        new: true
    });
});

const orderModel = model("order", orderSchema);

module.exports = { orderModel };
