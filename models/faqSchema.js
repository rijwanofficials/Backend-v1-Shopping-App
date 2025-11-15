const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const faqSchema = new Schema({
    question: {
        type: String,
        required: true,
        trim: true,
    },
    answer: {
        type: String,
        required: true,
    },
});

const FAQModel = model("FAQ", faqSchema);
module.exports = FAQModel;