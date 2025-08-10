module.exports = {
    name: 'copycat',
    description: 'Copy everything a mentioned user says. Usage: !copycat @user',
    async execute(message, args, client) {
        const mentionedUser = message.mentions.users.first();
        
        if (!mentionedUser) {
            return message.reply('Please mention a user to copycat. Usage: `!copycat @user`');
        }

        if (mentionedUser.id === client.user.id) {
            return message.reply('❌ Cannot copycat myself!');
        }

        if (mentionedUser.id === message.author.id) {
            return message.reply('❌ Cannot copycat yourself!');
        }

        // Initialize copycat storage if it doesn't exist
        if (!client.copycatTargets) client.copycatTargets = new Map();

        // Check if already copycatting this user
        if (client.copycatTargets.has(mentionedUser.id)) {
            // Remove from copycat list
            client.copycatTargets.delete(mentionedUser.id);
            return message.reply(`✅ Stopped copycatting ${mentionedUser.tag}`);
        } else {
            // Add to copycat list
            client.copycatTargets.set(mentionedUser.id, {
                userId: mentionedUser.id,
                username: mentionedUser.tag,
                channelId: message.channel.id,
                startedBy: message.author.id
            });
            return message.reply(`🐱 Started copycatting ${mentionedUser.tag}! Use the command again to stop.`);
        }
    }
};
