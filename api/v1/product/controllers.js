const mongoose = require('mongoose');
const { ProductModel } = require('../../../models/productSchema');
const { validateObjectId } = require("../../../utils/validateObjectId");
const { generateEmbedding } = require("../../../utils/geminiEmbed");

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

// ✅ Get products with filters, pagination, and search
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
            console.log("🔍 Performing semantic search for:", q);

            try {
                // 1️⃣ Generate embedding for the query
                const queryEmbedding = await generateEmbedding(q);

                // 2️⃣ Fetch all products with stored embeddings
                const allProducts = await ProductModel.find(
                    { embedding: { $exists: true } }
                ).select("title price images category embedding"); // Only select needed fields

                // 3️⃣ Define cosine similarity
                const cosineSimilarity = (a, b) => {
                    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
                    const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
                    const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
                    return dot / (normA * normB);
                };

                // 4️⃣ Compute similarity scores
                const ranked = allProducts
                    .map((p) => ({
                        ...p.toObject(),
                        similarity: cosineSimilarity(queryEmbedding, p.embedding),
                    }))
                    .filter((p) => p.similarity > 0.45) // keep only strong matches
                    .sort((a, b) => b.similarity - a.similarity)
                    .slice(0, 10); // Top 10

                // ❌ Remove embeddings before sending
                ranked.forEach(p => delete p.embedding);

                // ✅ Print only product titles in console
                console.log("✅ Top Semantic Results:");
                ranked.forEach((p, i) => console.log(`${i + 1}. ${p.title}`));

                // ✅ Send response
                return res.status(200).json({
                    isSuccess: true,
                    message: "Semantic search results fetched successfully",
                    data: {
                        products: ranked.map(({ _id, title, price, category, images, similarity }) => ({
                            _id,
                            title,
                            price,
                            category,
                            images,
                            similarity: similarity.toFixed(3), // rounded
                        })),
                    },
                });

            } catch (error) {
                console.error("❌ Semantic search failed, falling back:", error.message);
            }
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

        res.status(200).json({
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
        console.error("❌ Error inside listProductController:", err.message);
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