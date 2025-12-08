const express = require("express");
const { getAllFAQs, handleQuery } = require("./controller");

const chatRouter = express.Router();
chatRouter.get("/", getAllFAQs);

chatRouter.post("/query", handleQuery);

module.exports = { chatRouter };