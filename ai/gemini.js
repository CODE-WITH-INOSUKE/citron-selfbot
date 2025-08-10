const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

async function handleGemini(message, aiConfig, knowledge) {
    if (!message.attachments.size) {
        return 'Please attach an image to process.';
    }

    try {
        const genAI = new GoogleGenerativeAI(aiConfig.gemini.apiKey);
        const model = genAI.getGenerativeModel({ model: aiConfig.gemini.model });

        const attachment = message.attachments.first();
        if (!attachment.contentType?.startsWith('image/')) {
            return 'Please attach a valid image file.';
        }

        const response = await axios.get(attachment.url, { responseType: 'arraybuffer' });
        const imageData = Buffer.from(response.data, 'binary').toString('base64');

        const prompt = message.content.trim() || 'Describe this image';

        const result = await model.generateContent([
            knowledge.imagePrompt + '\n' + prompt,
            {
                inlineData: {
                    mimeType: attachment.contentType,
                    data: imageData
                }
            }
        ]);

        return result.response.text();
    } catch (error) {
        console.error('Gemini Error:', error);
        throw error;
    }
}

module.exports = { handleGemini };