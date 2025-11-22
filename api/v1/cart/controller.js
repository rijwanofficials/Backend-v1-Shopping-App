const { cartModel } = require("../../../models/cartSchema");

const addToCartController = async (req, res) => {
    try {
        const { productId } = req.params;
        const { id: userId } = req.currentUser;
        console.log("productId:", productId, "userId:", userId);

        let cartItem = await cartModel.findOne({ userId, productId });

        if (cartItem) {

            cartItem = await cartModel.findByIdAndUpdate(
                cartItem._id,
                { $inc: { cartQuantity: 1 } },
                { new: true }
            ).populate("productId");
        } else {

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
        console.log("Error in addToCartController:", err.message);
        res.status(500).json({
            isSuccess: false,
            message: "Failed to add product to cart",
            error: err.message,
        });
    }
};
const removeItemFromCartController = async (req, res) => {
    try {
        const { productId } = req.params;
        const { id: userId } = req.currentUser;

        const cartItem = await cartModel.findOne({ userId, productId });

        if (!cartItem) {
            return res.status(404).json({
                isSuccess: false,
                message: "Item not found in cart",
            });
        }

        if (cartItem.cartQuantity > 1) {
            const updatedItem = await cartModel.findByIdAndUpdate(
                cartItem._id,
                { $inc: { cartQuantity: -1 } },
                { new: true }
            ).populate("productId");

            return res.status(200).json({
                isSuccess: true,
                message: "Product quantity decreased by 1",
                cartItem: updatedItem,
            });
        } else {
            await cartModel.findByIdAndDelete(cartItem._id);
            return res.status(200).json({
                isSuccess: true,
                message: "Product removed from cart",
                cartItem: null,
            });
        }
    } catch (err) {
        console.log("Error in removeItemFromCartController:", err.message);
        res.status(500).json({
            isSuccess: false,
            message: "Failed to remove product from cart",
            error: err.message,
        });
    }
};

const getCartItemController = async (req, res) => {
    try {
        const { id: userId } = req.currentUser;

        const cartItems = await cartModel.find({ userId })
            .populate("productId")
            .lean();

        res.status(200).json({
            isSuccess: true,
            message: "Cart fetched successfully!",
            data: { cart: cartItems },
        });
    } catch (err) {
        console.log("Error in getCartItemController:", err.message);
        res.status(500).json({
            isSuccess: false,
            message: "Failed to fetch cart",
            error: err.message,
        });
    }
};

module.exports = {
    addToCartController,
    removeItemFromCartController,
    getCartItemController,
};
