const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    name: 'vcleave',
    description: 'Leave the current voice channel.',
    async execute(message, args, client) {
        const connection = getVoiceConnection(message.guild.id);
        
        if (!connection) {
            return message.reply('I\'m not connected to any voice channel.');
        }

        try {
            // Stop any playing music
            if (client.audioPlayers && client.audioPlayers.has(message.guild.id)) {
                const player = client.audioPlayers.get(message.guild.id);
                player.stop();
                player.queue = [];
                client.audioPlayers.delete(message.guild.id);
            }

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

            connection.destroy();
            message.reply('✅ Left the voice channel.');
        } catch (error) {
            console.error('Error leaving voice channel:', error);
            message.reply('❌ Failed to leave the voice channel.');
        }
    }
};
