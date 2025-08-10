const fetch = require('node-fetch');

module.exports = {
    name: 'slap',
    description: 'Slap someone with an anime GIF. Usage: !slap @user',
    async execute(message, args, client) {
        if (message.mentions.users.size === 0) {
            return message.reply('Please mention someone to slap! Usage: `!slap @user`');
        }

        const mentionedUser = message.mentions.users.first();
        
        try {
            const loadingMsg = await message.reply('👋 Preparing slap...');
            const response = await fetch('https://api.waifu.pics/sfw/slap');
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            await loadingMsg.edit(`**${message.author.username}** slaps **${mentionedUser.username}** 👋💢\n${data.url}`);
        } catch (error) {
            console.error('Slap command error:', error);
            message.reply('❌ Failed to fetch slap GIF!');
        }
    }
};
