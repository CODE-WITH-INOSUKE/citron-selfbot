const path = require('path');

function getCleanFilename(filePath) {
    return path.basename(filePath).replace(/\.[^/.]+$/, '');
}

function setCustomStatus(client, text) {
    if (client && client.user) {
        client.user.setPresence({
            activities: [{
                name: text,
                type: 'PLAYING'
            }],
            status: 'online'
        });
    }
}

function playSong(client, guildId, filePath) {
    try {
        const { createAudioResource } = require('@discordjs/voice');
        const player = client.audioPlayers.get(guildId);
        const resource = createAudioResource(filePath, {
            inlineVolume: true
        });
        resource.volume.setVolume(1);
        player.play(resource);

        const songName = getCleanFilename(filePath);
        setCustomStatus(client, `🎵 playing ${songName}`);

        return true;
    } catch (error) {
        console.error('Error playing song:', error);
        return false;
    }
}

module.exports = {
    name: 'skip',
    description: 'Skip the current song.',
    async execute(message, args, client) {
        if (!client.audioPlayers) return message.reply('No music is currently playing.');
        
        const player = client.audioPlayers.get(message.guild.id);
        if (!player) {
            return message.reply('No music is currently playing.');
        }

        if (!player.queue || player.queue.length === 0) {
            player.stop();
            setCustomStatus(client, '💭 chatting with friends');
            return message.reply('⏭️ Skipped the last song in queue.');
        }

        const nextSong = player.queue.shift();
        if (playSong(client, message.guild.id, nextSong.filePath)) {
            message.reply(`⏭️ Skipped to: ${getCleanFilename(nextSong.filePath)}`);
        } else {
            message.reply('Failed to play next song. Please try again.');
        }
    }
};
