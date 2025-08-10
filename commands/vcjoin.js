const { joinVoiceChannel, VoiceConnectionStatus, entersState } = require('@discordjs/voice');

module.exports = {
    name: 'vcjoin',
    description: 'Join a voice channel. Usage: !vcjoin <channel_id>',
    async execute(message, args, client) {
        if (!args.length) {
            return message.reply('Please provide a voice channel ID. Usage: `!vcjoin <channel_id>`');
        }

        const channelId = args[0];
        
        try {
            const channel = await client.channels.fetch(channelId);
            
            if (!channel || channel.type !== 'GUILD_VOICE') {
                return message.reply('Invalid voice channel ID or channel is not a voice channel.');
            }

            if (!channel.guild) {
                return message.reply('Unable to access guild information for this channel.');
            }

            // Join the voice channel
            const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
                selfDeaf: true,
                selfMute: false
            });

            // Wait for the connection to be ready
            try {
                await entersState(connection, VoiceConnectionStatus.Ready, 30000);
                message.reply(`✅ Successfully joined voice channel: ${channel.name}`);
            } catch (error) {
                connection.destroy();
                throw error;
            }

        } catch (error) {
            console.error('Error joining voice channel:', error);
            message.reply('❌ Failed to join the voice channel. Make sure the channel ID is valid and I have permission to join.');
        }
    }
};
