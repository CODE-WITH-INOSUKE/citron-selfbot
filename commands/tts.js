const gTTS = require('gtts');
const fs = require('fs').promises;
const path = require('path');

module.exports = {
    name: 'tts',
    description: 'Convert text to speech and send as an audio file',
    async execute(message, args, client) {
        if (!args.length) {
            return message.channel.send('Please provide text for TTS conversion.');
        }

        try {
            const text = args.join(' ');
            const gtts = new gTTS(text, 'en');
            const filePath = path.join(__dirname, '../tts_output.mp3');

            await new Promise((resolve, reject) => {
                gtts.save(filePath, (err) => {
                    if (err) reject(err);
                    resolve();
                });
            });

            await message.channel.send({
                files: [{
                    attachment: filePath,
                    name: 'tts_output.mp3'
                }]
            });

            await fs.unlink(filePath); // Clean up the file after sending
        } catch (error) {
            console.error('TTS command error:', error);
            await message.channel.send('Error generating TTS audio.');
        }
    }
};