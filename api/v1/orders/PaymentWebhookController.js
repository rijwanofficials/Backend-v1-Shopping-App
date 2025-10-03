const { cartModel } = require("../../../models/cartSchema");
const { orderModel } = require("../../../models/orderShema");

const paymentWebhookController = async (req, res) => {
  try {
    const { orderId, paymentStatus, userId } = req.body;

    if (paymentStatus === "SUCCESS") {
      // Update order as paid
      await orderModel.updateOne(
        { _id: orderId },
        { paymentStatus: "completed", orderStatus: "confirmed" }
      );

      // Clear user's cart
      await cartModel.deleteMany({ userId });

      return res.status(200).json({ success: true, message: "Payment successful, cart cleared" });
    } else {
      await orderModel.updateOne({ _id: orderId }, { paymentStatus: "failed" });
      return res.status(400).json({ success: false, message: "Payment failed" });
    }
  } catch (err) {
    console.error("Error in paymentWebhookController:", err.message);
    return res.status(500).json({ success: false, message: "Error handling payment" });
  }
};

module.exports = { paymentWebhookController };
