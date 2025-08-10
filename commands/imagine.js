const { handleShapes } = require('../ai/shapes');

module.exports = {
    name: 'imagine',
    description: 'Generate content using Shapes API',
    async execute(message, args, client) {
        const aiConfig = require('../ai-config.json');
        if (!args.length) {
            return message.channel.send('Please provide a prompt for the imagine command.');
        }

        try {
            const prompt = args.join(' ');
            const response = await handleShapes(prompt, aiConfig);
            await message.channel.send(response);
        } catch (error) {
            console.error('Imagine command error:', error);
            await message.channel.send('Error generating content with Shapes AI.');
        }
    }
};