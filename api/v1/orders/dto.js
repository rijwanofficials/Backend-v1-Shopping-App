const placeOrderVallidator = (req, res, next) => {
    console.log("------Inside placeOrderVallidator--------");
    try {

        // in order i will get two things products array and address
        const { address } = req.body;


        const { fullName, street, city, state, zipCode, country } = req.body.address || {};

        if (!fullName || !street || !city || !state || !zipCode || !country) {
            return res.status(400).json({
                isSuccess: false,
                message: "Please provide complete address details"
            });
        }

        // validation of products array and adress
        // if (!products || products.length == 0 || address == "" || !address) {
        //     return res.status(400).json({
        //         isSuccess: false,
        //         message: "products and address is required",
        //     });
        // }

        // Validation of productId and quantity of products
        // for (let product of products) {
        //     const { productId, quantity } = product;
        //     if (!productId || !quantity || quantity <= 0) {
        //         return res.status(400).json({
        //             isSuccess: false,
        //             message: "Product validation failed: productId or quantity is missing/invalid",
        //         });
        //     }
        // }



        // Validating productId formate
        // const isValid = mongoose.Types.ObjectId.isValid(productId)
        // if (!isValid) {
        //     return res.status(400).json({
        //         isSuccess: false,
        //         message: "Invalid productId format",
        //     });
        // }


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