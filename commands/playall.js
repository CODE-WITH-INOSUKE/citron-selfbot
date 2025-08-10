const fs = require('fs');
const path = require('path');
const { getVoiceConnection, createAudioPlayer, createAudioResource, NoSubscriberBehavior, AudioPlayerStatus } = require('@discordjs/voice');

const MUSIC_FOLDER = path.join(__dirname, '..', 'music');

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
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
        const player = client.audioPlayers.get(guildId);
        const resource = createAudioResource(filePath, {
            inlineVolume: true
        });
        resource.volume.setVolume(1);
        player.play(resource);

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
    name: 'playall',
    description: 'Play all music files in random order.',
    async execute(message, args, client) {
        const connection = getVoiceConnection(message.guild.id);
        if (!connection) {
            return message.reply('I\'m not connected to a voice channel. Use `!vcjoin <channel_id>` first.');
        }

        try {
            const files = fs.readdirSync(MUSIC_FOLDER).filter(file => file.endsWith('.mp3'));
            if (files.length === 0) {
                return message.reply('No music files found in the music folder.');
            }

            const shuffledFiles = shuffleArray([...files]);

            // Initialize audio players map if it doesn't exist
            if (!client.audioPlayers) client.audioPlayers = new Map();

            const player = createAudioPlayer({
                behaviors: {
                    noSubscriber: NoSubscriberBehavior.Play
                }
            });

            // Set up the queue BEFORE storing the player
            player.queue = shuffledFiles.slice(1).map(file => ({
                guildId: message.guild.id,
                filePath: path.join(MUSIC_FOLDER, file),
                client: client
            }));

            // Store player and client reference
            player.client = client;
            client.audioPlayers.set(message.guild.id, player);
            connection.subscribe(player);

            // Set up the event listener for when tracks end
            player.on(AudioPlayerStatus.Idle, () => {
                console.log('Track ended, checking queue...');
                if (player.queue && player.queue.length > 0) {
                    console.log(`Playing next song, ${player.queue.length} remaining`);
                    const nextSong = player.queue.shift();
                    playSong(client, nextSong.guildId, nextSong.filePath);
                } else {
                    console.log('Queue empty, resetting status');
                    setCustomStatus(client, '💭 chatting with friends');
                }
            });

            // Handle errors
            player.on('error', error => {
                console.error('Audio player error:', error.message);
            });

            // Play first song
            const firstSongPath = path.join(MUSIC_FOLDER, shuffledFiles[0]);
            if (playSong(client, message.guild.id, firstSongPath)) {
                message.reply(`🎵 Playing all music files in random order (${files.length} files)\nStarting with: ${getCleanFilename(shuffledFiles[0])}\nQueue: ${player.queue.length} songs remaining`);
            } else {
                message.reply('Failed to start playback. Please try again.');
            }

        } catch (error) {
            console.error('Error reading music folder:', error);
            message.reply('Failed to read the music folder.');
        }
    }
};
