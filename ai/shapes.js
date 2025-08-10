const { OpenAI } = require('openai');

async function handleShapes(prompt, aiConfig) {
    try {
        const shapesClient = new OpenAI({
            apiKey: aiConfig.shapes.apiKey,
            baseURL: 'https://api.shapes.inc/v1',
        });

        const response = await shapesClient.chat.completions.create({
            model: aiConfig.shapes.model,
            messages: [
                { role: 'user', content: `!imagine ${prompt}` }
            ]
        });

        return response.choices[0]?.message?.content || 'No response from Shapes AI.';
    } catch (error) {
        console.error('Shapes Error:', error);
        throw error;
    }
}

module.exports = { handleShapes };