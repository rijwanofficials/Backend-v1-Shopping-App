const { orderModel } = require("../../../../models/orderShema");

const getAllOrdersController = async (req, res) => {
    try {
        console.log("-------------Inside getAllOrdersController------------");
        const allOrders = await orderModel.find().populate("products.product");
        console.log("allOrders:", allOrders);

        res.status(200).json({
            success: true,
            orders: allOrders,
        });
    } catch (err) {
        console.log("-------------Error inside getAllOrdersController------------", err.message);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

module.exports = { getAllOrdersController };
