const updateProductValidator = (req, res, next) => {
    console.log("------Inside the UPDATE product validator--------");
    try {
        let { title, price, discription, quantity } = req.body;

        // title validation
        if (!title || title.length <= 2) {
            return res.status(400).json({
                isSuccess: false,
                message: "title length must be > 2",
                data: {}
            });
        }

        // convert to numbers if present
        if (price !== undefined) price = Number(price);
        if (quantity !== undefined) quantity = Number(quantity);

        // price validation
        if (price !== undefined) {
            if (isNaN(price) || price <= 1) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "price should be > 1",
                    data: {}
                });
            }
        }

        // quantity validation
        if (quantity !== undefined) {
            if (isNaN(quantity) || quantity < 0) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "quantity should be >= 0",
                    data: {}
                });
            }
        }

        // description validation
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

module.exports = { updateProductValidator };
