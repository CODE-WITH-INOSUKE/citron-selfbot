const fs = require('fs').promises;
const path = require('path');

module.exports = {
    name: 'notelist',
    description: 'List all notes for the user',
    async execute(message, args, client) {
        try {
            const notesDir = path.join(__dirname, '../database/notes');
            const files = await fs.readdir(notesDir);
            const userNotes = files
                .filter(file => file.startsWith(message.author.id + '_'))
                .map(file => file.replace(`${message.author.id}_`, '').replace('.txt', ''));

            const output = userNotes.length
                ? `Your notes:\n${userNotes.map(title => `  ${title}`).join('\n')}`
                : 'No notes found.';
                
            await message.channel.send(`\`\`\`\n${output}\n\`\`\``);
        } catch (error) {
            console.error('Notelist command error:', error);
            await message.channel.send('Error listing notes.');
        }
    }
};