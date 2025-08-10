module.exports = {
    name: 'stopstatus',
    description: 'Stop automatic status cycling and reset to default.',
    async execute(message, args, client) {
        try {
            // Clear the status rotation interval
            if (client.statusRotation) {
                clearInterval(client.statusRotation);
                client.statusRotation = null;
                
                // Reset to default RPC status if configured
                const fs = require('fs');
                const path = require('path');
                const configPath = path.join(__dirname, '..', 'data', 'rpcConfig.json');
                
                if (fs.existsSync(configPath)) {
                    const rpcData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                    if (rpcData.enabled && rpcData.type && rpcData.name) {
                        const activity = {
                            name: rpcData.name,
                            type: rpcData.type,
                            state: rpcData.type === 'CUSTOM' ? rpcData.name : undefined
                        };

                        if (rpcData.imageUrl) {
                            activity.assets = {
                                largeImage: rpcData.imageUrl,
                                largeText: rpcData.name
                            };
                        }

                        if (rpcData.type === 'STREAMING') {
                            activity.url = 'https://twitch.tv/discord';
                        }

                        await client.user.setPresence({
                            activities: [activity],
                            status: 'online'
                        });
                        
                        await message.reply('✅ **Status cycling stopped!**\n🔄 Reset to saved RPC status.');
                    } else {
                        // Reset to simple default
                        await client.user.setPresence({
                            activities: [{
                                name: '💭 chatting with friends',
                                type: 'PLAYING'
                            }],
                            status: 'online'
                        });
                        await message.reply('✅ **Status cycling stopped!**\n🔄 Reset to default status.');
                    }
                } else {
                    // Reset to simple default
                    await client.user.setPresence({
                        activities: [{
                            name: '💭 chatting with friends',
                            type: 'PLAYING'
                        }],
                        status: 'online'
                    });
                    await message.reply('✅ **Status cycling stopped!**\n🔄 Reset to default status.');
                }
            } else {
                await message.reply('❌ No status cycling is currently active.');
            }

        } catch (error) {
            console.error('Error stopping status cycling:', error);
            await message.reply('❌ Failed to stop status cycling.');
        }
    }
};
