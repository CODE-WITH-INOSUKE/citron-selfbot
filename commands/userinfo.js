module.exports = {
    name: 'userinfo',
    description: 'Show information about a user (!userinfo or !userinfo @user)',
    async execute(message, args, client) {
        try {
            const user = message.mentions.users.size ? message.mentions.users.first() : message.author;
            const member = await message.guild.members.fetch(user.id).catch(() => null);
            
            const info = [
                `Username: ${user.tag}`,
                `ID: ${user.id}`,
                `Created: ${user.createdAt.toISOString()}`,
                member ? `Joined: ${member.joinedAt.toISOString()}` : 'Joined: Not in server',
                `Bot: ${user.bot ? 'Yes' : 'No'}`,
            ].join('\n');

            await message.channel.send(`\`\`\`\n${info}\n\`\`\``);
        } catch (error) {
            console.error('Userinfo command error:', error);
            await message.channel.send('Error fetching user info.');
        }
    }
};