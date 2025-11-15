const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function getAIResponse(message) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const result = await model.generateContent(message);
        const response = result.response.text();
        return response;
    } catch (error) {
        console.error("Gemini AI Error:", error);
        return "Sorry, I could not process your request right now.";
    }
}
module.exports = getAIResponse;
