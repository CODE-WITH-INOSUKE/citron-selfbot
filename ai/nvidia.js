const axios = require('axios');

async function handleNvidia(message, aiConfig, knowledge) {
    try {
        const payload = {
            model: aiConfig.nvidia.model,
            messages: [
                { role: 'system', content: knowledge.textPrompt },
                { role: 'user', content: message.content }
            ],
            max_tokens: 512,
            temperature: 1.00,
            top_p: 1.00,
            frequency_penalty: 0.00,
            presence_penalty: 0.00,
            stream: false
        };

        const headers = {
            Authorization: `Bearer ${aiConfig.nvidia.apiKey}`,
            Accept: 'application/json'
        };

        const response = await axios.post(aiConfig.nvidia.invokeUrl, payload, { headers, responseType: 'json' });
        return response.data.choices[0]?.message?.content || 'No response from NVIDIA AI.';
    } catch (error) {
        console.error('NVIDIA Error:', error);
        throw error;
    }
}

module.exports = { handleNvidia };