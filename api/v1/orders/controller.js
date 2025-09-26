const { cartModel } = require("../../../models/cartSchema");
const { orderModel } = require("../../../models/orderShema");
const { ProductModel } = require('../../../models/productSchema');
const mongoose = require("mongoose")
const { createPaymentSessionController } = require('../orders/services');




const getUserOrdersController = async (req, res) => {
    console.log("-------------Inside getUserOrdersController------------");
    try {
        const userId = req.currentUser._id;
        console.log("userId", userId);
        const userOrders = await orderModel.find({ userId }).populate("products.product").sort({ createdAt: -1 });
        console.log("User Orders:", JSON.stringify(userOrders, null, 2));

        res.status(200).json({
            success: true,
            orders: userOrders
        });
    } catch (err) {
        console.log("-------------Error inside getUserOrdersController------------", err.message);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// Helper: Validates address object
const validateAddress = (address) => {
  return address && Object.values(address).every((val) => val);
};


//  * Helper: Runs the transaction to check stock, update quantities, and create order

const createOrderTransaction = async (cartSnapshot, address, userId, session) => {
  const orderItems = [];

  for (let item of cartSnapshot) {
    const product = await ProductModel.findById(item.productId).session(session);
    if (!product) throw new Error(`Product not found: ${item.productId}`);
    if (product.quantity < item.cartQuantity) throw new Error(`Out of stock: ${product.title}`);

    await ProductModel.findByIdAndUpdate(
      item.productId,
      { $inc: { quantity: -item.cartQuantity } },
      { new: true, session }
    );

    orderItems.push({
      product: item.productId,
      cartQuantity: item.cartQuantity,
      price: product.price,
    });
  }

  // Create order
  const [order] = await orderModel.create(
    [
      {
        userId,
        products: orderItems,
        address,
      },
    ],
    { session }
  );

  return { order, orderItems };
};


//  * Controller: Place Order

const placeOrderController = async (req, res) => {
  try {
    const { address } = req.body;
    const userId = req.currentUser?._id;

    // Validate user & address
    if (!userId) return res.status(401).json({ isSuccess: false, message: "User not authenticated" });
    if (!validateAddress(address)) return res.status(400).json({ isSuccess: false, message: "Incomplete address" });

    // Fetch cart
    const cartItems = await cartModel.find({ userId });
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ isSuccess: false, message: "Cart is empty" });
    }

    const cartSnapshot = cartItems.map((item) => ({ ...item._doc }));
    const session = await mongoose.startSession();
    let order, orderItems;

    try {
      await session.withTransaction(async () => {
        const result = await createOrderTransaction(cartSnapshot, address, userId, session);
        order = result.order;
        orderItems = result.orderItems;
      });
    } catch (err) {
      console.error("Transaction failed:", err.message);
      throw err;
    } finally {
      session.endSession();
    }

    // OPTIONAL: Clear cart after successful order
    await cartModel.deleteMany({ userId });

    // Compute total amount
    const totalAmount = orderItems.reduce((acc, item) => acc + item.price * item.cartQuantity, 0);

    // Create payment session
    const paymentResult = await createPaymentSessionController({
      totalAmount,
      orderId: order._id,
      userId,
      contactNumber: address.phoneNumber,
    });

    if (!paymentResult.success) {
      return res.status(400).json({
        isSuccess: false,
        message: "Payment session creation failed",
        error: paymentResult.message,
      });
    }

    // Success response
    return res.status(201).json({
      isSuccess: true,
      message: "Order placed successfully. Proceed to payment.",
      data: {
        orderId: order._id,
        totalAmount,
        orderItems,
        cartSnapshot,
        paymentDetails: paymentResult.data,
      },
    });
  } catch (err) {
    console.error("Error in placeOrderController:", err.message);
    return res.status(500).json({
      isSuccess: false,
      message: "Failed to place order",
      error: err.message,
    });
  }
};

module.exports = { placeOrderController, getUserOrdersController };
