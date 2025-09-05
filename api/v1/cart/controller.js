const { cartModel } = require("../../../models/cartSchema");

// Add product to cart
const addToCartController = async (req, res) => {
    console.log("<-----Inside addToCartController------>");
    try {
        const { productId } = req.params;
        const { _id: userId } = req.currentUser;

        let cartItem = await cartModel.findOne({ userId, productId });

        if (cartItem) {
            // Increment quantity and populate product info
            cartItem = await cartModel.findByIdAndUpdate(
                cartItem._id,
                { $inc: { cartQuantity: 1 } },
                { new: true }
            ).populate("productId");
        } else {
            // Create new cart item and populate product info
            cartItem = await cartModel.create({
                userId,
                productId,
                cartQuantity: 1,
            });
            cartItem = await cartModel.findById(cartItem._id).populate("productId");
        }

        res.status(200).json({
            isSuccess: true,
            message: "Product added to the cart!",
            cartItem,
        });
    } catch (err) {
        console.log("----Error inside addToCartController--->>", err.message);
        res.status(500).json({
            isSuccess: false,
            message: "Failed to add product to cart",
            error: err.message,
        });
    }
};

// Get cart items
const getCartItemController = async (req, res) => {
    console.log("<-----Inside getCartItemController------>");
    try {
        const { _id: userId } = req.currentUser;

        const cartItems = await cartModel.find({ userId })
            .populate("productId") // Populate product info
            .lean();

        res.status(200).json({
            isSuccess: true,
            message: "Cart fetched successfully!",
            data: {
                cart: cartItems
            }
        });
    } catch (err) {
        console.log("----Error inside getCartItemController--->>", err.message);
        res.status(500).json({
            isSuccess: false,
            message: "Failed to fetch cart",
            error: err.message
        });
    }
};

module.exports = { addToCartController, getCartItemController };
