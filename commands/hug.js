const fetch = require('node-fetch');

module.exports = {
    name: 'hug',
    description: 'Hug someone with an anime GIF. Usage: !hug @user',
    async execute(message, args, client) {
        if (message.mentions.users.size === 0) {
            return message.reply('Please mention someone to hug! Usage: `!hug @user`');
        }

        const mentionedUser = message.mentions.users.first();
        
        try {
            const loadingMsg = await message.reply('🤗 Preparing hug...');
            const response = await fetch('https://api.waifu.pics/sfw/hug');
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            await loadingMsg.edit(`**${message.author.username}** hugs **${mentionedUser.username}** 🤗💖\n${data.url}`);
        } catch (error) {
            console.error('Hug command error:', error);
            message.reply('❌ Failed to fetch hug GIF!');
        }
    }
};
