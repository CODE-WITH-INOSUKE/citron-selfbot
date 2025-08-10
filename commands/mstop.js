module.exports = {
    name: 'mstop',
    description: 'Stop the current music playback.',
    async execute(message, args, client) {
        if (!client.audioPlayers) return message.reply('No music is currently playing.');
        
        const player = client.audioPlayers.get(message.guild.id);
        if (!player) {
            return message.reply('No music is currently playing.');
        }

        player.stop();
        player.queue = [];
        
        // Reset status
        if (client && client.user) {
            client.user.setPresence({
                activities: [{
                    name: '💭 chatting with friends',
                    type: 'PLAYING'
                }],
                status: 'online'
            });
        }
        
        message.reply('⏹️ Stopped music playback.');
    }
};
