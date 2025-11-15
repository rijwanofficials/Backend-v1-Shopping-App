const mongoose = require('mongoose');
const { ProductModel } = require('../../../models/productSchema');
const { validateObjectId } = require("../../../utils/validateObjectId");
const { generateEmbedding } = require("../../../utils/geminiEmbed");
const { getAIResponse } = require('../../../utils/aiResponse');

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

const allowedCategories = [
    "womens-dresses",
    "womens-jewellery",
    "beauty",
    "womens-watches",
    "womens-shoes",
    "womens-bags",
    "motorcycle",
    "groceries",
    "furniture",
    "sports-accessories",
];

const listProductController = async (req, res) => {
    try {
        console.log("<----- Inside listProductController ----->");

        const {
            limit,
            page,
            select = "title price images quantity category",
            q = "",
            category = "",
            minPrice,
            maxPrice,
            sort = "title -price -createdAt",
        } = req.query;

        const limitNum = Math.min(Math.max(Number(limit) || 10, 1), 50);
        const pageNum = Math.max(parseInt(page) || 1, 1);
        const skipNum = (pageNum - 1) * limitNum;

        // ---------------- SEMANTIC SEARCH ----------------
        if (q) {
            console.log("Performing semantic search for:", q);

            const queryEmbedding = await generateEmbedding(q);

            const results = await ProductModel.aggregate([
                {
                    $vectorSearch: {
                        index: "vector_index",
                        path: "embedding",
                        queryVector: queryEmbedding,
                        numCandidates: 500,
                        limit: 5,
                    },
                },
                {
                    $project: {
                        _id: 1,
                        title: 1,
                        description: 1,
                        category: 1,
                        price: 1,
                        images: 3,
                    },
                },
            ])
            // RAG - Retrieval Augmented Generation

            const prompt = `
      User asked: "${q}"

      Based on the products we have, give a short helpful answer and mention some relevant items.

      Relevant products from our database:
      ${JSON.stringify(results, null, 2)}

      You are an e-commerce assistant helping users discover products.
      `;

            const responseText = await getAIResponse(prompt);

            console.log("Gemini Response Text:", responseText);

            console.log("✅ Semantic search results:", results.length);
            return res.json({
                isSuccess: true,
                message:
                    results.length > 0
                        ? "Semantic search results fetched successfully"
                        : "No products found for the query",
                data: {
                    products: results,
                    total: results.length,
                    aiResponse: responseText
                },
            });
        }

        // ---------------- NORMAL FILTERS ----------------
        const query = ProductModel.find();
        query.select(select.split(",").join(" "));

        if (category) {
            const categories = category
                .split(",")
                .map((c) => c.trim().toLowerCase())
                .filter(Boolean);
            if (categories.length > 0) query.where("category").in(categories);
        }

        const min = Number(minPrice);
        const max = Number(maxPrice);
        if (!isNaN(min)) query.where("price").gte(min);
        if (!isNaN(max)) query.where("price").lte(max);
        if (!isNaN(min) && !isNaN(max) && min > max) {
            return res.status(400).json({
                isSuccess: false,
                message: "minPrice cannot be greater than maxPrice",
            });
        }

        const totalDocumentsCount = await query.clone().countDocuments();
        query.skip(skipNum).limit(limitNum);
        query.sort(sort);
        const normalProducts = await query;

        return res.status(200).json({
            isSuccess: true,
            message:
                normalProducts.length > 0
                    ? "Products fetched successfully"
                    : "No products found for the given filters",
            data: {
                products: normalProducts,
                total: totalDocumentsCount,
                skip: skipNum,
                limit: limitNum,
            },
        });
    } catch (err) {
        console.error("❌ Error inside listProductController:", err);
        res.status(500).json({
            isSuccess: false,
            message: "Failed to fetch products",
            error: err.message,
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


// GET /api/categories
const getFilteredProductsController = async (req, res) => {
    try {
        const { category } = req.query;
        let { minPrice, maxPrice } = req.query;

        minPrice = minPrice ? Number(minPrice) : 0;
        maxPrice = maxPrice ? Number(maxPrice) : 1000000;

        if (isNaN(minPrice) || isNaN(maxPrice)) {
            return res.status(400).json({
                success: false,
                message: "minPrice and maxPrice must be numbers",
            });
        }

        if (minPrice < 0) {
            return res.status(400).json({
                success: false,
                message: "minPrice cannot be negative",
            });
        }

        if (minPrice > maxPrice) {
            return res.status(400).json({
                success: false,
                message: "minPrice cannot be greater than maxPrice",
            });
        }

        if (category) {
            const categoryExists = await ProductModel.exists({ category });
            if (!categoryExists) {
                return res.status(404).json({
                    success: false,
                    message: `Category: ${category}, not found.`,
                });
            }
        }

        const filter = {
            price: { $gte: minPrice, $lte: maxPrice },
        };

        if (category) filter.category = category;

        const products = await ProductModel.find(filter);

        res.status(200).json({
            success: true,
            count: products.length,
            products,
        });
    } catch (error) {
        console.error("Error fetching filtered products:", error);
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};


// Controllers for embedding all products
const embedAllProducts = async (req, res) => {
    try {
        const products = await ProductModel.find();

        if (!products.length) {
            return res.status(404).json({ message: "No products found" });
        }

        for (const product of products) {
            console.log(`🟡 Before embedding: ${product.title}`);
            const text = `${product.title} ${product.description || ""} ${product.category || ""} ${product.brand || ""}`;
            const embedding = await generateEmbedding(text);
            product.embedding = embedding;
            await product.save();
            console.log(`✅ After embedding: ${product.title}`);
            console.log(embedding.slice(0, 10), "..."); // print first 10 values for clarity
        }

        res.json({ message: "✅ All products embedded successfully" });
    } catch (error) {
        console.error("❌ Error generating embeddings:", error.message);
        res.status(500).json({ error: "Error generating embeddings" });
    }
};




module.exports = {
    createProductController,
    getAllProductController,
    editProductController,
    deleteProductController,
    listProductController,
    viewProductController,
    getFilteredProductsController,
    embedAllProducts
}