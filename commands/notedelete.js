const fs = require('fs').promises;
const path = require('path');

module.exports = {
    name: 'notedelete',
    description: 'Delete a note by title (!notedelete <title>)',
    async execute(message, args, client) {
        if (!args[0]) {
            return message.channel.send('Please provide the note title to delete (!notedelete title).');
        }

        try {
            const title = args[0];
            const notePath = path.join(__dirname, '../database/notes', `${message.author.id}_${title}.txt`);

            await fs.unlink(notePath);
            await message.channel.send(`Note "${title}" deleted.`);
        } catch (error) {
            console.error('Notedelete command error:', error);
            await message.channel.send(`Error deleting note: ${error.message.includes('ENOENT') ? 'Note not found.' : 'Unknown error.'}`);
        }
    }
};