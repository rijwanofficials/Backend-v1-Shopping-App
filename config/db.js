const mongoose = require("mongoose");

console.log("🔍 Trying to connect to MongoDB...");

mongoose
  .connect(process.env.MONGO_DB_URL, { dbName: "dummy-shopping-app-v1" })
  .then(() => {
    console.log("-----✅ MongoDB connected to cluster-----");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });
