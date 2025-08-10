module.exports = {
    name: 'eval',
    description: 'Evaluate JavaScript code (primary user only)',
    async execute(message, args, client) {
        // Restrict to primary user (first in allowedUserIds)
        if (message.author.id !== client.config.allowedUserIds[0]) {
            return message.channel.send('This command is restricted to the primary user.');
        }

        if (!args.length) {
            return message.channel.send('Please provide JavaScript code to evaluate.');
        }

        try {
            const code = args.join(' ');
            const result = eval(code); // Execute the code
            const output = typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result);

            await message.channel.send(`\`\`\`js\n${output}\n\`\`\``);
        } catch (error) {
            console.error('Eval command error:', error);
            await message.channel.send(`\`\`\`js\nError: ${error.message}\n\`\`\``);
        }
    }
};