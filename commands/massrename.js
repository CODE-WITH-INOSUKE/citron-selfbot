module.exports = {
    name: 'massrename',
    description: 'Mass rename users excluding admins and mods. Usage: !massrename <new_name> <number_of_users>',
    async execute(message, args, client) {
        if (args.length < 2) {
            return message.reply('Please provide a name and number of users to rename. Usage: `!massrename <new_name> <number_of_users>`');
        }

        // Check if user has permission
        if (!message.member.permissions.has('MANAGE_NICKNAMES') && !message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply('❌ You need "Manage Nicknames" or "Administrator" permission to use this command.');
        }

        const newName = args[0];
        const numberOfUsers = parseInt(args[1]);

        // Validate number
        if (isNaN(numberOfUsers) || numberOfUsers <= 0 || numberOfUsers > 50) {
            return message.reply('❌ Please provide a valid number between 1 and 50.');
        }

        try {
            // Fetch all guild members
            await message.guild.members.fetch();
            
            // Get all members excluding bots, admins, mods, and the command user
            const eligibleMembers = message.guild.members.cache.filter(member => {
                // Skip bots
                if (member.user.bot) return false;
                
                // Skip the command author
                if (member.id === message.author.id) return false;
                
                // Skip if member has admin permissions
                if (member.permissions.has('ADMINISTRATOR')) return false;
                
                // Skip if member has mod-like permissions (CORRECTED PERMISSION NAMES)
                if (member.permissions.has('MANAGE_MESSAGES') || 
                    member.permissions.has('MANAGE_GUILD') ||        // Changed from MANAGE_MEMBERS
                    member.permissions.has('MANAGE_CHANNELS') || 
                    member.permissions.has('BAN_MEMBERS') || 
                    member.permissions.has('KICK_MEMBERS') ||
                    member.permissions.has('MODERATE_MEMBERS')) {    // Added for timeout permissions
                    return false;
                }
                
                // Skip if bot can't change their nickname (role hierarchy)
                const botMember = message.guild.members.cache.get(client.user.id);
                if (member.roles.highest.position >= botMember.roles.highest.position) {
                    return false;
                }
                
                return true;
            });

            if (eligibleMembers.size === 0) {
                return message.reply('❌ No eligible members found to rename (excluding admins, mods, and bots).');
            }

            // Limit to requested number or available members
            const membersToRename = eligibleMembers.random(Math.min(numberOfUsers, eligibleMembers.size));
            const actualCount = Array.isArray(membersToRename) ? membersToRename.length : 1;
            const membersArray = Array.isArray(membersToRename) ? membersToRename : [membersToRename];

            // Send confirmation message
            const confirmMsg = await message.reply(`🔄 Starting mass rename...\nTarget: **${newName}**\nUsers to affect: **${actualCount}** (excluding admins/mods)\n\nProcessing...`);

            let successCount = 0;
            let failCount = 0;
            const errors = [];

            // Rename members one by one with delay to avoid rate limits
            for (let i = 0; i < membersArray.length; i++) {
                const member = membersArray[i];
                
                try {
                    await member.setNickname(newName, `Mass rename by ${message.author.tag}`);
                    successCount++;
                    
                    // Add delay to prevent rate limiting
                    if (i < membersArray.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
                    }
                } catch (error) {
                    failCount++;
                    errors.push(`${member.user.tag}: ${error.message}`);
                    console.error(`Failed to rename ${member.user.tag}:`, error);
                }

                // Update progress every 5 users
                if ((i + 1) % 5 === 0) {
                    try {
                        await confirmMsg.edit(`🔄 Mass rename in progress...\nProgress: **${i + 1}**/**${membersArray.length}**\nSuccessful: **${successCount}** | Failed: **${failCount}**`);
                    } catch (err) {
                        // Ignore edit errors
                    }
                }
            }

            // Final results
            let resultMessage = `✅ **Mass Rename Complete!**\n\n`;
            resultMessage += `**Target Name:** ${newName}\n`;
            resultMessage += `**Successfully Renamed:** ${successCount}\n`;
            resultMessage += `**Failed:** ${failCount}\n`;
            resultMessage += `**Total Processed:** ${successCount + failCount}`;

            if (errors.length > 0 && errors.length <= 5) {
                resultMessage += `\n\n**Errors:**\n`;
                resultMessage += errors.slice(0, 5).map(err => `• ${err}`).join('\n');
            } else if (errors.length > 5) {
                resultMessage += `\n\n**Errors:** ${errors.length} total (check console for details)`;
            }

            await confirmMsg.edit(resultMessage);

        } catch (error) {
            console.error('Mass rename error:', error);
            message.reply('❌ An error occurred during the mass rename process.');
        }
    }
};
