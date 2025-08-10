const fetch = require('node-fetch');

module.exports = {
    name: 'waifu',
    description: 'Get a random waifu anime image.',
    async execute(message, args, client) {
        try {
            const loadingMsg = await message.reply('👸 Fetching waifu...');
            const response = await fetch('https://api.waifu.pics/sfw/waifu');
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            await loadingMsg.edit(`**Random Waifu** 👸\n${data.url}`);
        } catch (error) {
            console.error('Waifu command error:', error);
            message.reply('❌ Failed to fetch waifu image!');
        }
    }
};
