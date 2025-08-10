const fetch = require('node-fetch');

module.exports = {
    name: 'pat',
    description: 'Pat someone with an anime GIF. Usage: !pat @user',
    async execute(message, args, client) {
        if (message.mentions.users.size === 0) {
            return message.reply('Please mention someone to pat! Usage: `!pat @user`');
        }

        const mentionedUser = message.mentions.users.first();
        
        try {
            const loadingMsg = await message.reply('👋 Preparing pat...');
            const response = await fetch('https://api.waifu.pics/sfw/pat');
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            await loadingMsg.edit(`**${message.author.username}** pats **${mentionedUser.username}** 👋💕\n${data.url}`);
        } catch (error) {
            console.error('Pat command error:', error);
            message.reply('❌ Failed to fetch pat GIF!');
        }
    }
};
