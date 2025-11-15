const FAQModel = require("../../../models/faqSchema");
const getAIResponse = require("../../../utils/aiClients");


// ✅ Get all FAQs (optional for admin)
const getAllFAQs = async (req, res) => {
    try {
        const faqs = await FAQModel.find();
        res.status(200).json({
            success: true,
            data: faqs
        }
        );
    } catch (error) {
        res.status(500).json(
            {
                success: false,
                message: error.message
            }
        );
    }
};


const handleQuery = async (req, res) => {
    try {
        const { query } = req.body;
        if (!query)
            return res.status(400).json(
                {
                    success: false,
                    message: "Query is required"
                }
            );

        const faq = await FAQModel.findOne({ question: { $regex: query, $options: "i" } });
        if (faq) {
            return res.status(200).json(
                {
                    success: true,
                    answer: faq.answer,
                    source: "faq"
                }
            );
        }
        const aiAnswer = await getAIResponse(query);
        res.status(200).json({ success: true, answer: aiAnswer, source: "gemini" });
    } catch (error) {
        res.status(500).json(
            {
                success: false,
                message: error.message
            }
        );
    }
};

module.exports = { getAllFAQs, handleQuery };
