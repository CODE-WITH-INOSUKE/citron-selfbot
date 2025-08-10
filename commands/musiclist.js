const fs = require('fs');
const path = require('path');

const MUSIC_FOLDER = path.join(__dirname, '..', 'music');

function getCleanFilename(filePath) {
    return path.basename(filePath).replace(/\.[^/.]+$/, '');
}

module.exports = {
    name: 'musiclist',
    description: 'Show available music files with pagination.',
    async execute(message, args, client) {
        try {
            if (!fs.existsSync(MUSIC_FOLDER)) {
                return message.reply('Music folder not found.');
            }

            const files = fs.readdirSync(MUSIC_FOLDER).filter(file => file.endsWith('.mp3'));
            if (files.length === 0) {
                return message.reply('No music files found in the music folder.');
            }

            const sortedFiles = files.sort((a, b) => 
                getCleanFilename(a).localeCompare(getCleanFilename(b))
            );

            const itemsPerPage = 10;
            const totalPages = Math.ceil(sortedFiles.length / itemsPerPage);
            let currentPage = 1;

            const getPageContent = (page) => {
                const start = (page - 1) * itemsPerPage;
                const end = start + itemsPerPage;
                const pageFiles = sortedFiles.slice(start, end);
                
                return `📋 **Music Files (Page ${page}/${totalPages})**\n\n${
                    pageFiles.map((file, i) => `${start + i + 1}. ${getCleanFilename(file)}`).join('\n')
                }\n\n⬅️ Previous | Next ➡️`;
            };

            const listMsg = await message.reply(getPageContent(currentPage));

            if (totalPages > 1) {
                await listMsg.react('⬅️');
                await listMsg.react('➡️');

                const filter = (reaction, user) => 
                    ['⬅️', '➡️'].includes(reaction.emoji.name) && 
                    user.id === message.author.id;

                const collector = listMsg.createReactionCollector({ 
                    filter, 
                    time: 60000
                });

                collector.on('collect', async (reaction, user) => {
                    try {
                        await reaction.users.remove(user.id);
                    } catch (err) {
                        // Ignore permission errors
                    }

                    if (reaction.emoji.name === '➡️' && currentPage < totalPages) {
                        currentPage++;
                        await listMsg.edit(getPageContent(currentPage));
                    }
                    else if (reaction.emoji.name === '⬅️' && currentPage > 1) {
                        currentPage--;
                        await listMsg.edit(getPageContent(currentPage));
                    }
                });

                collector.on('end', () => {
                    try {
                        listMsg.reactions.removeAll();
                    } catch (err) {
                        // Ignore permission errors
                    }
                });
            }

        } catch (error) {
            console.error('Error reading music folder:', error);
            message.reply('Failed to read the music folder.');
        }
    }
};
