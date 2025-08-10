const fs = require('fs').promises;
const path = require('path');

module.exports = {
    name: 'help',
    description: 'Display all available commands with pagination',
    async execute(message, args, client) {
        try {
            const commandFiles = await fs.readdir(path.join(__dirname));
            const commands = [];
            
            for (const file of commandFiles) {
                if (file.endsWith('.js') && file !== 'help.js') { // Exclude help command from listing itself
                    try {
                        const command = require(path.join(__dirname, file));
                        if (command.name && command.description) {
                            commands.push({ name: command.name, description: command.description });
                        }
                    } catch (err) {
                        // Skip files that can't be loaded
                        console.warn(`Could not load command file: ${file}`);
                    }
                }
            }

            if (commands.length === 0) {
                return message.channel.send('No commands found.');
            }

            // Sort commands alphabetically
            commands.sort((a, b) => a.name.localeCompare(b.name));

            const commandsPerPage = 15;
            const totalPages = Math.ceil(commands.length / commandsPerPage);
            let currentPage = 1;

            // Function to generate page content
            const getPageContent = (page) => {
                const start = (page - 1) * commandsPerPage;
                const end = start + commandsPerPage;
                const pageCommands = commands.slice(start, end);
                
                const commandList = pageCommands
                    .map(cmd => `!${cmd.name}: ${cmd.description}`)
                    .join('\n');
                
                return `**📋 Commands (Page ${page}/${totalPages}) - Total: ${commands.length} commands**\n\`\`\`js\n${commandList}\n\`\`\`\n\`\`\`html\n🤖 Made by INOSUKE_ON_DRUGXXX\`\`\`${totalPages > 1 ? '\n\n⬅️ Previous | Next ➡️' : ''}`;
            };

            // Send initial message
            const helpMsg = await message.channel.send(getPageContent(currentPage));

            // Only add reactions if there are multiple pages
            if (totalPages > 1) {
                await helpMsg.react('⬅️');
                await helpMsg.react('➡️');
                
                // Store help data for reaction handling
                if (!client.helpReactions) client.helpReactions = new Map();
                client.helpReactions.set(helpMsg.id, {
                    originalMessage: message,
                    commands,
                    totalPages,
                    currentPage: 1,
                    commandsPerPage
                });

                // Create reaction collector
                const reactionCollector = helpMsg.createReactionCollector({ 
                    filter: (reaction, user) => user.id === message.author.id && ['⬅️', '➡️'].includes(reaction.emoji.name),
                    time: 300000 // 5 minutes
                });

                reactionCollector.on('collect', async (reaction, user) => {
                    const helpData = client.helpReactions.get(helpMsg.id);
                    if (!helpData) return;

                    if (reaction.emoji.name === '➡️' && helpData.currentPage < helpData.totalPages) {
                        helpData.currentPage++;
                    } else if (reaction.emoji.name === '⬅️' && helpData.currentPage > 1) {
                        helpData.currentPage--;
                    }

                    // Update message with new page
                    try {
                        const start = (helpData.currentPage - 1) * helpData.commandsPerPage;
                        const end = start + helpData.commandsPerPage;
                        const pageCommands = helpData.commands.slice(start, end);
                        
                        const commandList = pageCommands
                            .map(cmd => `!${cmd.name}: ${cmd.description}`)
                            .join('\n');
                        
                        const newContent = `**📋 Commands (Page ${helpData.currentPage}/${helpData.totalPages}) - Total: ${helpData.commands.length} commands**\n\`\`\`js\n${commandList}\n\`\`\`\n\`\`\`html\n🤖 Made by INOSUKE_ON_DRUGXXX\`\`\`\n\n⬅️ Previous | Next ➡️`;
                        
                        await helpMsg.edit(newContent);
                    } catch (error) {
                        console.error('Error updating help page:', error);
                    }

                    // No reaction removal - just let them accumulate
                });

                reactionCollector.on('end', () => {
                    // Only clean up stored data, don't touch reactions
                    client.helpReactions.delete(helpMsg.id);
                });
            }

        } catch (error) {
            console.error('Help command error:', error);
            await message.channel.send('Error retrieving command list.');
        }
    }
};
