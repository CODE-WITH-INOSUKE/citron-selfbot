const fetch = require('node-fetch');

module.exports = {
    name: 'kiss',
    description: 'Kiss someone with an anime GIF. Usage: !kiss @user',
    async execute(message, args, client) {
        if (message.mentions.users.size === 0) {
            return message.reply('Please mention someone to kiss! Usage: `!kiss @user`');
        }

        const mentionedUser = message.mentions.users.first();
        
        try {
            const loadingMsg = await message.reply('😘 Preparing kiss...');
            const response = await fetch('https://api.waifu.pics/sfw/kiss');
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            await loadingMsg.edit(`**${message.author.username}** kisses **${mentionedUser.username}** 😘💋\n${data.url}`);
        } catch (error) {
            console.error('Kiss command error:', error);
            message.reply('❌ Failed to fetch kiss GIF!');
        }
    }
};
