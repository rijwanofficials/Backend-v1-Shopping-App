const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const productSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
        min: 1,
    },
    quantity: {
        type: Number,
        default: 1,
        min: 0,
    },
    description: {
        type: String,
    },
    category: {
        type: String,
        required: true,
        trim: true,
    },
    brand: {
        type: String,
        trim: true,
    },
    thumbnail: {
        type: String,
    },
    images: [String],
}, {
    timestamps: true,
    versionKey: false,
});

// Ensure validation runs on update
productSchema.pre("findOneAndUpdate", function () {
    this.set({
        runValidators: true,
        new: true
    });
});

const ProductModel = model("product", productSchema);

module.exports = { ProductModel };
