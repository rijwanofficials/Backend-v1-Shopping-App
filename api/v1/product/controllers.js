const mongoose = require('mongoose');
const { ProductModel } = require('../../../models/productSchema');
const { validateObjectId } = require("../../../utils/validateObjectId");

// CREATE Product 
const createProductController = async (req, res) => {
    try {
        console.log("-----Inside createProductController-----");
        const data = req.body;
        const newProduct = await ProductModel.create(data);
        res.status(201).json({
            isSuccess: true,
            message: "Product Created...",
            data: {
                product: newProduct,
            }
        })
    }
    catch (err) {
        console.log("----Error inside createProductController--->>", err.message);
        if (err.name == "ValidationError" || err.code == 1100) {
            res.status(400).json({
                isSuccess: false,
                message: err.message,
                data: {}
            });
            return;
        };
        res.status(500).json({
            isSuccess: false,
            message: "internal Server Error",
            data: {}
        });
    }
}

// GET Product 
const getAllProductController = async (req, res) => {
    console.log("<-----Inside getAllProductController------>");
    try {
        const products = await ProductModel.find();
        res.status(200).json({
            isSuccess: true,
            message: "Products fetched successfully...",
            data: {
                products: products
            }
        });
    } catch (err) {
        console.log("----Error inside getAllProductController--->>", err.message);
        res.status(500).json({
            isSuccess: false,
            message: "Failed to fetch products",
            error: err.message
        });
    };
};

// EDIT Product 
const editProductController = async (req, res) => {
    console.log("<-----Inside editProductController------>");
    const { id } = req.params;

    // Validate before proceeding
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
};

// DELETE Product 
const deleteProductController = async (req, res) => {
    console.log("<-----Inside deleteProductController------>");
    const { id } = req.params;

    // Validate before proceeding
    if (!validateObjectId(id, res)) return;
    try {
        const product = await ProductModel.findByIdAndDelete(id);
        if (!product) {
            return res.status(404).json({
                isSuccess: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            isSuccess: true,
            message: "Product deleted successfully",
        })
    } catch (err) {
        console.log("----Error inside deleteProductController--->>", err.message);
        res.status(500).json({
            isSuccess: false,
            message: "Failed to delete product",
            error: err.message
        });
    }
};

// GET products with parameter
const listProductController = async (req, res) => {
    try {
        console.log("<-----Inside listProductController------>");
        // -------- Extract query parameters --------
        const {
            limit,
            page,
            select = "title price images quantity category", // added category field
            q = "",                                 // search query
            category = "",                          // new param for category
            maxPrice,
            minPrice,
            sort = "title -price -createdAt"        // default sorting
        } = req.query;

        // -------- Regex for search --------
        const searchRegex = new RegExp(q, "i");

        // -------- Convert select param --------
        const selectedItems = select.split(",").join(" ");

        // -------- Limit validation --------
        let limitNum = Number(limit);
        if (limitNum <= 0 || Number.isNaN(limitNum)) {
            limitNum = 5;
        }
        if (limitNum >= 30) {
            limitNum = 30;
        }

        // -------- Page validation --------
        let pageNum = parseInt(page) || 1;
        if (pageNum <= 0 || Number.isNaN(pageNum)) {
            pageNum = 1;
        }
        const skipNum = (pageNum - 1) * limitNum;

        // -------- Start building query --------
        const query = ProductModel.find();

        // 1. SELECT fields
        query.select(selectedItems);

        // 2. SEARCH (only if q is provided)
        if (q) {
            query.or([{ title: searchRegex }, { description: searchRegex }]);
        }

        // 3. CATEGORY FILTER
        if (category) {
            query.where("category").equals(new RegExp(category, "i"));
            // case-insensitive match
        }

        // 4. PRICE FILTERS
        if (maxPrice && !isNaN(Number(maxPrice))) {
            query.where("price").lte(Number(maxPrice));
        }

        if (minPrice && !isNaN(Number(minPrice))) {
            query.where("price").gte(Number(minPrice));
        }

        // 5. COUNT total before skip & limit
        const queryCopy = query.clone();
        const totalDocumentsCount = await queryCopy.countDocuments();

        // 6. PAGINATION
        query.skip(skipNum);
        query.limit(limitNum);

        // 7. SORTING
        query.sort(sort);

        // -------- Execute final query --------
        const products = await query;

        // -------- Response --------
        res.status(200).json({
            isSuccess: true,
            message: "Products list...",
            data: {
                products,
                total: totalDocumentsCount,
                skip: skipNum,
                limit: Math.min(limitNum, products.length)
            }
        });

    } catch (err) {
        console.log("----Error inside listProductController--->>", err.message);
        res.status(500).json({
            isSuccess: false,
            message: "Failed to fetch products",
            error: err.message
        });
    }
};


// VIEW Product
const viewProductController = async (req, res) => {
    console.log("<-----Inside viewProductController------>");
    try {
        const { id } = req.params
        const product = await ProductModel.findById(id);

        if (product == null) {
            return res.status(404).json({
                isSuccess: false,
                message: "Product not found with particular Id"
            });
        }
        res.status(200).json({
            isSuccess: true,
            message: "Product found!",
            data: {
                product: product
            },
        });
    } catch (err) {
        console.log("----Error inside viewProductController--->>", err.message);
        res.status(500).json({
            isSuccess: false,
            message: "Failed to fetch product ",
            error: err.message
        });
    };
};


module.exports = { createProductController, getAllProductController, editProductController, deleteProductController, listProductController, viewProductController }