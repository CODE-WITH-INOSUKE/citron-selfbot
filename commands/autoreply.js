module.exports = {
    name: 'autoreply',
    description: 'Set an automatic reply to a specific user. Usage: !autoreply @user',
    async execute(message, args, client) {
        const mentionedUser = message.mentions.users.first();
        
        if (!mentionedUser) {
            return message.reply('Please mention a user to set autoreply for. Usage: `!autoreply @user`');
        }

        if (mentionedUser.id === client.user.id) {
            return message.reply('❌ Cannot set autoreply for myself!');
        }

        if (mentionedUser.id === message.author.id) {
            return message.reply('❌ Cannot set autoreply for yourself!');
        }

        // Initialize autoreply storage if it doesn't exist
        if (!client.autoreplies) client.autoreplies = new Map();

        // Check if autoreply already exists for this user
        const existingReply = client.autoreplies.get(mentionedUser.id);
        if (existingReply) {
            // Remove existing autoreply
            client.autoreplies.delete(mentionedUser.id);
            return message.reply(`✅ Removed autoreply for ${mentionedUser.tag}`);
        }

        // Ask for the reply message
        const setupMsg = await message.reply(`📝 Please send the message you want to automatically reply with when ${mentionedUser.tag} speaks:`);

        // Wait for user's reply
        const filter = m => m.author.id === message.author.id && m.channel.id === message.channel.id;
        
        try {
            const collected = await message.channel.awaitMessages({ 
                filter, 
                max: 1, 
                time: 60000, 
                errors: ['time'] 
            });
            
            const replyMessage = collected.first().content;
            
            if (!replyMessage || replyMessage.length > 2000) {
                return setupMsg.edit('❌ Invalid message. Please make sure it\'s not empty and under 2000 characters.');
            }

            // Store the autoreply
            client.autoreplies.set(mentionedUser.id, {
                userId: mentionedUser.id,
                username: mentionedUser.tag,
                replyMessage: replyMessage,
                channelId: message.channel.id,
                setBy: message.author.id
            });

            await setupMsg.edit(`✅ **Autoreply set for ${mentionedUser.tag}!**\n\n**Will reply with:** ${replyMessage}\n\n*Use the command again to remove.*`);
            
            // Delete the user's reply message
            try {
                await collected.first().delete();
            } catch (err) {
                // Ignore if can't delete
            }

        } catch (error) {
            await setupMsg.edit('❌ Setup cancelled (timeout). Please try again.');
        }
    }
};
