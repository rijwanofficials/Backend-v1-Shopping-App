const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function getAIResponse(prompt) {
    try {
        // ✅ Use the correct model ID for text generation
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

        const result = await model.generateContent(prompt);
        const response = result.response.text();
        return response;
    } catch (error) {
        console.error("Error generating AI response:", error);
        return "Sorry, I couldn’t process your request right now.";
    }
}

module.exports = { getAIResponse };
