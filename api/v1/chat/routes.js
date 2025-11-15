const express = require("express");
const { getAllFAQs, handleQuery } = require("./controller");


// GET all FAQs
const chatRouter = express.Router();
chatRouter.get("/", getAllFAQs);

// POST user query
chatRouter.post("/query", handleQuery);

module.exports = { chatRouter };
