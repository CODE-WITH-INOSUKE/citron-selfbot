const Groq = require('groq-sdk');

async function handleGroq(message, aiConfig, knowledge) {
    try {
        const groq = new Groq({ apiKey: aiConfig.groq.apiKey });
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: knowledge.textPrompt },
                { role: 'user', content: message.content }
            ],
            model: aiConfig.groq.model
        });
        return chatCompletion.choices[0]?.message?.content || 'No response from AI.';
    } catch (error) {
        console.error('Groq Error:', error);
        throw error;
    }
}

module.exports = { handleGroq };