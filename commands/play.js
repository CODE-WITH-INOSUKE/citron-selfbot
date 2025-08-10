const { createAudioPlayer, createAudioResource, AudioPlayerStatus, getVoiceConnection, NoSubscriberBehavior } = require('@discordjs/voice');
const fs = require('fs');
const path = require('path');

const MUSIC_FOLDER = path.join(__dirname, '..', 'music');

// Store active audio players per guild (attach to client for persistence)
function getAudioPlayer(client, guildId) {
    if (!client.audioPlayers) client.audioPlayers = new Map();
    
    if (!client.audioPlayers.has(guildId)) {
        const player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Play
            }
        });
        
        client.audioPlayers.set(guildId, player);
        
        // Handle when track ends
        player.on(AudioPlayerStatus.Idle, () => {
            if (player.queue && player.queue.length > 0) {
                const nextSong = player.queue.shift();
                playSong(client, nextSong.guildId, nextSong.filePath);
            } else {
                // Reset status when no more songs in queue
                setCustomStatus(client, '💭 chatting with friends');
            }
        });

        player.on('error', error => {
            console.error('Audio player error:', error.message);
        });
    }
    return client.audioPlayers.get(guildId);
}

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
        const player = getAudioPlayer(client, guildId);
        const resource = createAudioResource(filePath, {
            inlineVolume: true
        });
        resource.volume.setVolume(1);
        player.play(resource);

        // Update status with current song
        const songName = getCleanFilename(filePath);
        setCustomStatus(client, `🎵 playing ${songName}`);

        resource.playStream.on('error', error => {
            console.error('Error playing file:', error);
        });

        return true;
    } catch (error) {
        console.error('Error playing song:', error);
        return false;
    }
}

module.exports = {
    name: 'play',
    description: 'Play a music file from the music folder. Usage: !play <filename>',
    async execute(message, args, client) {
        if (args.length === 0) {
            return message.reply('Please provide a filename to play. Use `!musiclist` to see available files.');
        }

        const connection = getVoiceConnection(message.guild.id);
        if (!connection) {
            return message.reply('I\'m not connected to a voice channel. Use `!vcjoin <channel_id>` first.');
        }

        const searchName = args.join(' ').toLowerCase();
        
        try {
            const files = fs.readdirSync(MUSIC_FOLDER);
            const matchingFile = files.find(file => 
                getCleanFilename(file).toLowerCase() === searchName
            );

            if (!matchingFile) {
                return message.reply('That file doesn\'t exist in the music folder. Use `!musiclist` to see available files.');
            }

            const filePath = path.join(MUSIC_FOLDER, matchingFile);
            const player = getAudioPlayer(client, message.guild.id);
            connection.subscribe(player);

            if (playSong(client, message.guild.id, filePath)) {
                message.reply(`🎵 Now playing: ${getCleanFilename(matchingFile)}`);
            } else {
                message.reply('Failed to play the file. Please try again.');
            }
        } catch (error) {
            console.error('Error accessing music folder:', error);
            message.reply('Failed to access the music folder.');
        }
    }
};
