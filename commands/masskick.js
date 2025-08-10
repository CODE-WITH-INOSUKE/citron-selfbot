module.exports = {
    name: 'masskick',
    description: 'Mass kick mentioned users. Usage: !masskick @user1 @user2 @user3...',
    async execute(message, args, client) {
        // Check if user has permission
        if (!message.member.permissions.has('KICK_MEMBERS') && !message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply('❌ You need "Kick Members" or "Administrator" permission to use this command.');
        }

        // Check if any users are mentioned
        if (message.mentions.users.size === 0) {
            return message.reply('❌ Please mention users to kick. Usage: `!masskick @user1 @user2 @user3...`');
        }

        // Get mentioned members
        const mentionedMembers = message.mentions.members;
        const kickableMembers = [];
        const unkickableMembers = [];

        // Check each mentioned member
        mentionedMembers.forEach(member => {
            // Can't kick yourself
            if (member.id === message.author.id) {
                unkickableMembers.push({ member, reason: 'Cannot kick yourself' });
                return;
            }

            // Can't kick the bot
            if (member.id === client.user.id) {
                unkickableMembers.push({ member, reason: 'Cannot kick the bot' });
                return;
            }

            // Check if bot can kick this member (role hierarchy)
            const botMember = message.guild.members.cache.get(client.user.id);
            if (member.roles.highest.position >= botMember.roles.highest.position) {
                unkickableMembers.push({ member, reason: 'Higher role than bot' });
                return;
            }

            // Check if command user can kick this member
            if (member.roles.highest.position >= message.member.roles.highest.position) {
                unkickableMembers.push({ member, reason: 'Higher role than you' });
                return;
            }

            // Check if member has admin permissions
            if (member.permissions.has('ADMINISTRATOR')) {
                unkickableMembers.push({ member, reason: 'Has administrator permission' });
                return;
            }

            // Check if member is kickable
            if (!member.kickable) {
                unkickableMembers.push({ member, reason: 'Not kickable' });
                return;
            }

            kickableMembers.push(member);
        });

        if (kickableMembers.length === 0) {
            let errorMsg = '❌ No users can be kicked.\n\n**Issues:**\n';
            unkickableMembers.forEach(item => {
                errorMsg += `• ${item.member.user.tag}: ${item.reason}\n`;
            });
            return message.reply(errorMsg);
        }

        // Confirmation message
        let confirmMsg = `⚠️ **Mass Kick Confirmation**\n\n`;
        confirmMsg += `**Users to kick:** ${kickableMembers.length}\n`;
        kickableMembers.forEach(member => {
            confirmMsg += `• ${member.user.tag}\n`;
        });

        if (unkickableMembers.length > 0) {
            confirmMsg += `\n**Skipped:** ${unkickableMembers.length}\n`;
            unkickableMembers.forEach(item => {
                confirmMsg += `• ${item.member.user.tag} (${item.reason})\n`;
            });
        }

        confirmMsg += `\n**Type "CONFIRM" to proceed with kicking ${kickableMembers.length} users.**`;

        const confirmation = await message.reply(confirmMsg);

        // Wait for confirmation
        const filter = m => m.author.id === message.author.id && m.content.toUpperCase() === 'CONFIRM';
        
        try {
            await message.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] });
        } catch {
            return confirmation.edit('❌ Mass kick cancelled (timeout).');
        }

        // Start kicking process
        const processMsg = await message.reply('🔄 Starting mass kick process...');
        
        let successCount = 0;
        let failCount = 0;
        const errors = [];

        for (let i = 0; i < kickableMembers.length; i++) {
            const member = kickableMembers[i];
            
            try {
                await member.kick(`Mass kick by ${message.author.tag}`);
                successCount++;
                
                // Add delay to prevent rate limiting
                if (i < kickableMembers.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            } catch (error) {
                failCount++;
                errors.push(`${member.user.tag}: ${error.message}`);
                console.error(`Failed to kick ${member.user.tag}:`, error);
            }

            // Update progress
            if ((i + 1) % 3 === 0) {
                try {
                    await processMsg.edit(`🔄 Mass kick in progress...\nProgress: **${i + 1}**/**${kickableMembers.length}**\nSuccessful: **${successCount}** | Failed: **${failCount}**`);
                } catch (err) {
                    // Ignore edit errors
                }
            }
        }

        // Final results
        let resultMessage = `✅ **Mass Kick Complete!**\n\n`;
        resultMessage += `**Successfully Kicked:** ${successCount}\n`;
        resultMessage += `**Failed:** ${failCount}\n`;
        resultMessage += `**Total Processed:** ${successCount + failCount}`;

        if (errors.length > 0 && errors.length <= 3) {
            resultMessage += `\n\n**Errors:**\n`;
            resultMessage += errors.map(err => `• ${err}`).join('\n');
        } else if (errors.length > 3) {
            resultMessage += `\n\n**Errors:** ${errors.length} total (check console for details)`;
        }

        await processMsg.edit(resultMessage);
    }
};
