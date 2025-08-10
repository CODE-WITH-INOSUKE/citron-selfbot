module.exports = {
    name: 'dm',
    description: 'Send a DM to a mentioned user (!dm @user text)',
    async execute(message, args, client) {
        if (!message.mentions.users.size || args.length < 2) {
            return message.channel.send('Please mention a user and provide a message (!dm @user text).');
        }

        try {
            const user = message.mentions.users.first();
            const text = args.slice(1).join(' ');
            await user.send(text);
            await message.channel.send(`DM sent to ${user.tag}.`);
        } catch (error) {
            console.error('DM command error:', error);
            await message.channel.send('Error sending DM.');
        }
    }
};