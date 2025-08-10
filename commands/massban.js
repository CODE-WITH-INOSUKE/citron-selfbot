module.exports = {
    name: 'massban',
    description: 'Mass ban mentioned users. Usage: !massban @user1 @user2 @user3...',
    async execute(message, args, client) {
        // Check if user has permission
        if (!message.member.permissions.has('BAN_MEMBERS') && !message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply('❌ You need "Ban Members" or "Administrator" permission to use this command.');
        }

        // Check if any users are mentioned
        if (message.mentions.users.size === 0) {
            return message.reply('❌ Please mention users to ban. Usage: `!massban @user1 @user2 @user3...`');
        }

        // Get mentioned members
        const mentionedMembers = message.mentions.members;
        const bannableMembers = [];
        const unbannableMembers = [];

        // Check each mentioned member
        mentionedMembers.forEach(member => {
            // Can't ban yourself
            if (member.id === message.author.id) {
                unbannableMembers.push({ member, reason: 'Cannot ban yourself' });
                return;
            }

            // Can't ban the bot
            if (member.id === client.user.id) {
                unbannableMembers.push({ member, reason: 'Cannot ban the bot' });
                return;
            }

            // Check if bot can ban this member (role hierarchy)
            const botMember = message.guild.members.cache.get(client.user.id);
            if (member.roles.highest.position >= botMember.roles.highest.position) {
                unbannableMembers.push({ member, reason: 'Higher role than bot' });
                return;
            }

            // Check if command user can ban this member
            if (member.roles.highest.position >= message.member.roles.highest.position) {
                unbannableMembers.push({ member, reason: 'Higher role than you' });
                return;
            }

            // Check if member has admin permissions
            if (member.permissions.has('ADMINISTRATOR')) {
                unbannableMembers.push({ member, reason: 'Has administrator permission' });
                return;
            }

            // Check if member is bannable
            if (!member.bannable) {
                unbannableMembers.push({ member, reason: 'Not bannable' });
                return;
            }

            bannableMembers.push(member);
        });

        if (bannableMembers.length === 0) {
            let errorMsg = '❌ No users can be banned.\n\n**Issues:**\n';
            unbannableMembers.forEach(item => {
                errorMsg += `• ${item.member.user.tag}: ${item.reason}\n`;
            });
            return message.reply(errorMsg);
        }

        // Confirmation message
        let confirmMsg = `🚨 **MASS BAN CONFIRMATION - THIS IS PERMANENT!**\n\n`;
        confirmMsg += `**Users to ban:** ${bannableMembers.length}\n`;
        bannableMembers.forEach(member => {
            confirmMsg += `• ${member.user.tag}\n`;
        });

        if (unbannableMembers.length > 0) {
            confirmMsg += `\n**Skipped:** ${unbannableMembers.length}\n`;
            unbannableMembers.forEach(item => {
                confirmMsg += `• ${item.member.user.tag} (${item.reason})\n`;
            });
        }

        confirmMsg += `\n⚠️ **WARNING: Bans are permanent! Type "CONFIRM BAN" to proceed.**`;

        const confirmation = await message.reply(confirmMsg);

        // Wait for confirmation (stricter for bans)
        const filter = m => m.author.id === message.author.id && m.content.toUpperCase() === 'CONFIRM BAN';
        
        try {
            await message.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] });
        } catch {
            return confirmation.edit('❌ Mass ban cancelled (timeout).');
        }

        // Start banning process
        const processMsg = await message.reply('🔄 Starting mass ban process...');
        
        let successCount = 0;
        let failCount = 0;
        const errors = [];

        for (let i = 0; i < bannableMembers.length; i++) {
            const member = bannableMembers[i];
            
            try {
                await member.ban({ 
                    deleteMessageDays: 1, // Delete 1 day of messages
                    reason: `Mass ban by ${message.author.tag}` 
                });
                successCount++;
                
                // Add delay to prevent rate limiting
                if (i < bannableMembers.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1500)); // Longer delay for bans
                }
            } catch (error) {
                failCount++;
                errors.push(`${member.user.tag}: ${error.message}`);
                console.error(`Failed to ban ${member.user.tag}:`, error);
            }

            // Update progress
            if ((i + 1) % 2 === 0) {
                try {
                    await processMsg.edit(`🔄 Mass ban in progress...\nProgress: **${i + 1}**/**${bannableMembers.length}**\nSuccessful: **${successCount}** | Failed: **${failCount}**`);
                } catch (err) {
                    // Ignore edit errors
                }
            }
        }

        // Final results
        let resultMessage = `✅ **Mass Ban Complete!**\n\n`;
        resultMessage += `**Successfully Banned:** ${successCount}\n`;
        resultMessage += `**Failed:** ${failCount}\n`;
        resultMessage += `**Total Processed:** ${successCount + failCount}\n`;
        resultMessage += `**Message Deletion:** 1 day`;

        if (errors.length > 0 && errors.length <= 3) {
            resultMessage += `\n\n**Errors:**\n`;
            resultMessage += errors.map(err => `• ${err}`).join('\n');
        } else if (errors.length > 3) {
            resultMessage += `\n\n**Errors:** ${errors.length} total (check console for details)`;
        }

        await processMsg.edit(resultMessage);
    }
};
