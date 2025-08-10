const fetch = require('node-fetch');

module.exports = {
    name: 'neko',
    description: 'Get a cute neko anime image.',
    async execute(message, args, client) {
        try {
            const loadingMsg = await message.reply('🐱 Fetching neko...');
            const response = await fetch('https://api.waifu.pics/sfw/neko');
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            await loadingMsg.edit(`**Cute Neko** 🐱\n${data.url}`);
        } catch (error) {
            console.error('Neko command error:', error);
            message.reply('❌ Failed to fetch neko image!');
        }
    }
};
