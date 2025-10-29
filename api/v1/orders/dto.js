const placeOrderVallidator = (req, res, next) => {
    console.log("------Inside placeOrderVallidator--------");
    try {
        const { fullName, street, city, state, zipCode, country } = req.body.address || {};
        if (!fullName || !street || !city || !state || !zipCode || !country) {
            return res.status(400).json({
                isSuccess: false,
                message: "Please provide complete address details"
            });
        }
        next();
    } catch (err) {
        console.error("------Error Inside placeOrderVallidator--------", err.message);
        res.status(500).json({
            isSuccess: false,
            message: "Validation error",
            err: err.message,
        });
    }
};
module.exports = { placeOrderVallidator }