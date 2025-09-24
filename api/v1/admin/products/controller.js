const { ProductModel } = require("../../../../models/productSchema");
const { validateObjectId } = require("../../../../utils/validateObjectId");

const updateProductController = async (req, res) => {
    console.log("<-----Inside editProductController------>");
    const { id } = req.params;
    if (!validateObjectId(id, res)) return;
    try {
        const updatedProduct = await ProductModel.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        ).lean();
        if (!updatedProduct) {
            return res.status(404).json({
                isSuccess: false,
                message: "Product not found"
            });
        }
        res.status(200).json({
            isSuccess: true,
            message: "Product updated successfully",
            data: { product: updatedProduct }
        })
    } catch (err) {
        console.log("----Error inside editProductController--->>", err.message);
        res.status(500).json({
            isSuccess: false,
            message: "Failed to update product",
            error: err.message
        });
    }
}

module.exports = { updateProductController };   