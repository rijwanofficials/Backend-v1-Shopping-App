// utils/validateObjectId.js
const mongoose = require("mongoose");
const validateObjectId = (id, res) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({
            isSuccess: false,
            message: "Invalid ID format"
        });
        return false; //  Stop controller execution
    }
    return true; // ID is valid
};

module.exports = { validateObjectId };