const { cartModel } = require("../../../models/cartSchema");
const { orderModel } = require("../../../models/orderShema");
const { ProductModel } = require('../../../models/productSchema');
const mongoose = require("mongoose")

const placeOrderController = async (req, res) => {
    try {
        console.log("-------------InSide placeOrderController------------");

        const { address } = req.body;
        const { fullName, phoneNumber, street, city, state, zipCode, country } = address;
        const { _id: userId } = req.currentUser;

        const cartItems = await cartModel.find({ userId: userId });
        // Check if cart is empty
        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({
                isSuccess: false,
                message: "Cart is empty",
            });
        }

        // Validate address
        if (!address || (typeof address === "string" && address.trim() === "")) {
            return res.status(400).json({
                isSuccess: false,
                message: "Address is required",
            });
        }


        const session = await mongoose.startSession();

        try {
            await session.withTransaction(async () => {
                for (let item of cartItems) {
                    const { productId, cartQuantity } = item;
                    console.log("Checking productId:", productId);
                    const existingProduct = await ProductModel.findById(productId).session(session);
                    if (!existingProduct) {
                        console.error("Product not found in DB:", productId);
                        throw new Error("Invalid product in the cart");
                    }
                    if (existingProduct.quantity < cartQuantity) {
                        throw new Error("Some items are out of Stock!");
                    }
                    const updatedProduct = await ProductModel.findByIdAndUpdate(
                        productId,
                        { $inc: { quantity: -cartQuantity } },
                        { new: true, session }
                    );
                    if (!updatedProduct || updatedProduct.quantity < 0) {
                        throw new Error("Some items are out of stock!");
                    }
                }
                const productsWithPrice = await Promise.all(
                    cartItems.map(async (item) => {
                        const product = await ProductModel.findById(item.productId).lean();
                        return {
                            product: item.productId,
                            cartQuantity: item.cartQuantity,
                            price: product.price
                        };
                    })
                );
                await orderModel.create([{
                    userId,
                    products: productsWithPrice,
                    address: { fullName, phoneNumber, street, city, state, zipCode, country }
                }], { session });

            });
        } catch (err) {
            console.error("Transaction failed:", err);
            throw err;
        }


        // OPTIONAL: Clear cart after successful order
        await cartModel.deleteMany({ userId });
        // If all items are in stock

        return res.status(201).json({
            isSuccess: true,
            message: "Order placed successfully",
        });

        // create an order with the address
    } catch (err) {
        console.log("Error in placeOrderController:", err.message);
        res.status(500).json({
            isSuccess: false,
            message: "Failed to place order",
        });
    }
};


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

module.exports = { placeOrderController, getUserOrdersController };
