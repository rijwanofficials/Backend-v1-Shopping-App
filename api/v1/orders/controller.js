const { cartModel } = require("../../../models/cartSchema");
const { ProductModel } = require("../../../models/productSchema");

const placeOrderController = async (req, res) => {
    try {
        console.log("-------------InSide placeOrderController------------");

        const { address } = req.body;
        const { _id: userId } = req.currentUser;
        console.log("User ID:", userId);

        const cartItems = await cartModel.find({ userId: userId });
        console.log("Cart Items fetched from DB:", cartItems);

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

        let allItemsAreInStock = true;
        const updatedProducts = [];

        // Check and update product stock
        for (let item of cartItems) {
            const { productId, cartQuantity: quantity } = item;

            const updatedProduct = await ProductModel.findByIdAndUpdate(
                productId,
                { $inc: { quantity: -1 * quantity } },
                { new: true }
            );

            updatedProducts.push({ productId, quantity }); // store for rollback

            if (!updatedProduct || updatedProduct.quantity < 0) {
                allItemsAreInStock = false;
            }
        }

        // Rollback if any product went below stock
        if (!allItemsAreInStock) {
            for (let item of updatedProducts) {
                await ProductModel.findByIdAndUpdate(item.productId, {
                    $inc: { quantity: item.quantity },
                });
            }

            // setting cart items to zero after placing order
            await cartModel.deleteMany({ userId });


            return res.status(500).json({
                isSuccess: false,
                message: "Some items are not in stock",
                data: {},
            });
        }

        // OPTIONAL: Clear cart after successful order
        // await cartModel.deleteMany({ userId });

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
            error: err.message,
        });
    }
};

module.exports = { placeOrderController };
