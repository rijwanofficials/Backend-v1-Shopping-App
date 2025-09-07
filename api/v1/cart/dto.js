const mongoose = require("mongoose");

const updateItemCartController = (req, res, next) => {
    console.log("------Inside updateItemCartController--------");
    try {
        const { productId } = req.params;

        if (!productId) {
            return res.status(400).json({
                isSuccess: false,
                message: "productId not found",
            });
            
        }

        const isValid = mongoose.Types.ObjectId.isValid(productId)
        if (!isValid) {
            return res.status(400).json({
                isSuccess: false,
                message: "Invalid productId format",
            });
        } 

        next();
    } catch (err) {
        console.error("------Error Inside updateItemCartController--------", err);
        res.status(500).json({
            isSuccess: false,
            message: "Validation error",
            err: err.message,
        });
    }
};

module.exports = { updateItemCartController };
