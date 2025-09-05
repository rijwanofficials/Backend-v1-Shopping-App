const { validateObjectId } = require("../../../utils/validateObjectId");

const createProductValidator = (req, res, next) => {
    try {
        console.log("----Inside createProductValidator----");
        const { title, price, discription, quantity } = req.body;

        // Quantity validation
        if (quantity && quantity < 0) {
            return res.status(400).json({
                isSuccess: false,
                message: "Quantity should be >= 0",
                data: {}
            });
        }

        // Price validation
        if (!price || price < 1) {
            return res.status(400).json({
                isSuccess: false,
                message: "Price should be > 1",
                data: {}
            });
        }

        // Title validation
        if (!title || title.length <= 2) {
            return res.status(400).json({
                isSuccess: false,
                message: "Title length must be > 2",
                data: {}
            });
        }

        // Description validation
        if (discription && discription.length < 5) {
            return res.status(400).json({
                isSuccess: false,
                message: "Description is too short",
                data: {}
            });
        }

        next();
    } catch (err) {
        console.error("----Error Inside createProductValidator---->", err.message);
        res.status(500).json({
            isSuccess: false,
            message: "Internal Server Error",
            data: {}
        });
    }
};



const updateProductValidator = (req, res, next) => {
    console.log("------Inside the UPDATE product validator--------");
    try {
        const { title, price, discription, quantity } = req.body;
        // title validation
        if (!title || title.length <= 2) {
            return res.status(400).json({
                isSuccess: false,
                message: "title length must be > 2",
                data: {}
            });
        }

        // quantity validation
        if (quantity && quantity < 0) {
            res.status(400).json({
                isSuccess: false,
                message: "quantity should be > 0 ",
                data: {}
            });
            return;
        }

        if (price || price < 1) {
            res.status(400).json({
                isSuccess: false,
                message: "price should be > 1",
                data: {}
            });
            return;
        }

        if (discription && discription.length < 5) {
            return res.status(400).json({
                isSuccess: false,
                message: "Description is too short",
                data: {}
            });
        }

        next();
    } catch (err) {
        res.status(500).json({
            isSuccess: false,
            message: "Validation error",
            err: err.message
        });
    }
};

const viewProductValidator = (req, res, next) => {
    console.log("------Inside the viewProductValidator--------");
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({
                isSuccess: false,
                message: "Product Id not found",
            });
            return;
        }
        if (!validateObjectId(id, res)) return;
        next();

    } catch (err) {
        res.status(500).json({
            isSuccess: false,
            message: "Validation error",
            err: err.message
        });
    }
};


module.exports = { createProductValidator, updateProductValidator, viewProductValidator };
