const { ObjectId } = require('mongodb');
const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const cartSchema = new Schema({
    userId: {
        type: ObjectId,
        ref: "user",   
        required: true
    },
    productId: {
        type: ObjectId,
        ref: "product",  
        required: true
    },
    cartQuantity: {
        type: Number,
        default: 1,  
        min: 1
    }
}, {
    timestamps: true,
    versionKey: false,
});

// -------------Default Preferences----------
cartSchema.pre("findOneAndUpdate", function () {
    this.set({
        runValidators: true,
        new: true
    });
});

const cartModel = model("cart", cartSchema);

module.exports = { cartModel };
