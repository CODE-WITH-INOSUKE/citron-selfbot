const fs = require('fs').promises;
const path = require('path');

module.exports = {
    name: 'noteadd',
    description: 'Add a note saved as a text file (!noteadd <title> <content>)',
    async execute(message, args, client) {
        if (args.length < 2) {
            return message.channel.send('Please provide a note title and content (!noteadd title content).');
        }

        try {
            const title = args[0];
            const content = args.slice(1).join(' ');
            const notePath = path.join(__dirname, '../database/notes', `${message.author.id}_${title}.txt`);

            await fs.writeFile(notePath, content);
            await message.channel.send(`Note "${title}" saved.`);
        } catch (error) {
            console.error('Noteadd command error:', error);
            await message.channel.send('Error saving note.');
        }
    }
};