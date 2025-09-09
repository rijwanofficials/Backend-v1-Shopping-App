require("dotenv").config();
const mongoose = require("mongoose");
const data = require("./data.json");
const { ProductModel } = require("../models/productSchema");

async function main() {
    try {
        // connect to your cluster + database
        await mongoose.connect(process.env.MONGO_DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("✅ Connected to MongoDB Atlas");

        // map your products
        const products = data.products.map(p => ({
            title: p.title,
            description: p.description,
            price: Math.round(p.price * 80),
            quantity: p.stock,
            category: p.category,
            brand: p.brand,
            thumbnail: p.thumbnail,
            images: p.images,
            createdAt: new Date(),
            updatedAt: new Date()
        }));

        // insert into DB
        await ProductModel.insertMany(products, { ordered: false });
        console.log("✅ Products inserted successfully!");

        await mongoose.disconnect();
    } catch (err) {
        console.error("❌ Migration failed:", err.message);
        process.exit(1);
    }
}

main();
