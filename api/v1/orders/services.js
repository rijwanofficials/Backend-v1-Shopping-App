const cashfreePaymentGateway = require("../../../config/cashfreePaymentGateway");

const createPaymentSessionController = async ({ totalAmount, orderId, userId, contactNumber }) => {
  console.log("-------------Inside createPaymentSessionController------------");

  const request = {
    order_amount: totalAmount,
    order_currency: "INR",
    order_id: orderId,
    customer_details: {
      customer_id: userId,
      customer_phone: contactNumber,
    },
    order_meta: {
      return_url: `https://www.cashfree.com/devstudio/preview/pg/web/popupCheckout?order_id=${orderId}`,
    },
  };

  try {
    const response = await cashfreePaymentGateway.PGCreateOrder(request);
    console.log(`Order created successfully for ${userId}:`, response.data);

    // Return structured result
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error:", error.response?.data?.message || error.message);
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

module.exports = { createPaymentSessionController };
