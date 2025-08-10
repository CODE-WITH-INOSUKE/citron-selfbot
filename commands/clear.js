module.exports = {
    name: 'clear',
    description: 'Delete the bot\'s own messages (1 to 100)',
    async execute(message, args, client) {
        if (!args[0]) {
            return message.channel.send('Please specify the number of messages to delete (1 to 100).');
        }

        const amount = parseInt(args[0], 10);
        if (isNaN(amount) || amount < 1 || amount > 100) {
            return message.channel.send('Please provide a valid number between 1 and 100.');
        }

        try {
            // Fetch messages in the channel
            const messages = await message.channel.messages.fetch({ limit: 100 });
            // Filter for bot's own messages
            const botMessages = messages.filter(msg => msg.author.id === client.user.id).first(amount);
            
            // Delete each message individually
            for (const msg of botMessages) {
                await msg.delete();
            }

            await message.channel.send(`Successfully deleted ${botMessages.length} of my messages.`);
        } catch (error) {
            console.error('Clear command error:', error);
            await message.channel.send('Error deleting messages.');
        }
    }
};