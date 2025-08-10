const fetch = require('node-fetch');

module.exports = {
    name: 'cuddle',
    description: 'Cuddle someone with an anime GIF. Usage: !cuddle @user',
    async execute(message, args, client) {
        if (message.mentions.users.size === 0) {
            return message.reply('Please mention someone to cuddle! Usage: `!cuddle @user`');
        }

        const mentionedUser = message.mentions.users.first();
        
        try {
            const loadingMsg = await message.reply('🤗 Preparing cuddle...');
            const response = await fetch('https://api.waifu.pics/sfw/cuddle');
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            await loadingMsg.edit(`**${message.author.username}** cuddles **${mentionedUser.username}** 🤗💝\n${data.url}`);
        } catch (error) {
            console.error('Cuddle command error:', error);
            message.reply('❌ Failed to fetch cuddle GIF!');
        }
    }
};
