const { validateObjectId } = require("../../../utils/validateObjectId");

const addToCartValidator = (req, res,next) => {
    console.log("------Inside the addToCartValidator--------");
    try {
        const {productId } = req.params;

        if (!productId) {
            res.status(400).json({
                isSuccess: false,
                message: "userId and productId not found",
            });
            return;
        }
        if (!validateObjectId(productId, res)) return;
        next();
    } catch (err) {
        console.log("------Error Inside the addToCartValidator--------");
        res.status(500).json({
            isSuccess: false,
            message: "Validation error",
            err: err.message
        });
    }
};

module.exports = { addToCartValidator }