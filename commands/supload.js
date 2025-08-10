const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const MUSIC_FOLDER = path.join(__dirname, '..', 'music');

function getCleanFilename(filePath) {
    return path.basename(filePath).replace(/\.[^/.]+$/, '');
}

module.exports = {
    name: 'supload',
    description: 'Upload an MP3 file to the music folder. Attach file and optionally provide custom name.',
    async execute(message, args, client) {
        if (!message.attachments.size) {
            return message.reply('Please attach an MP3 file to upload.');
        }

        const attachment = message.attachments.first();
        
        if (!attachment.name.toLowerCase().endsWith('.mp3')) {
            return message.reply('Only MP3 files are supported.');
        }

        try {
            if (!fs.existsSync(MUSIC_FOLDER)) {
                fs.mkdirSync(MUSIC_FOLDER, { recursive: true });
            }

            let filename = args.length > 0 ? 
                args.join(' ') + '.mp3' : 
                attachment.name;

            // Clean the filename
            filename = filename.replace(/[^a-zA-Z0-9\s\-\_\.]/g, '');

            const filePath = path.join(MUSIC_FOLDER, filename);

            // Download and save the file
            const response = await fetch(attachment.url);
            const buffer = await response.arrayBuffer();
            
            fs.writeFileSync(filePath, Buffer.from(buffer));

            message.reply(`✅ Successfully uploaded song: ${getCleanFilename(filename)}`);
        } catch (error) {
            console.error('Error uploading song:', error);
            message.reply('❌ Failed to upload the song. Please try again.');
        }
    }
};
