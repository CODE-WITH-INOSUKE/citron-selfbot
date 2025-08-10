module.exports = {
    name: 'statusimg',
    description: 'Set status with a custom image link and options. Usage: !statusimg <image_url> [status_text]',
    async execute(message, args, client) {
        if (!args.length) {
            return message.reply('Please provide an image URL. Usage: `!statusimg <image_url> [status_text]`\n\n**Examples:**\n• `!statusimg https://i.imgur.com/example.png Gaming`\n• `!statusimg https://cdn.example.com/img.jpg 🎵 listening to music`');
        }

        const imageUrl = args[0];
        const statusText = args.slice(1).join(' ') || '🎨 custom status with image';

        // Enhanced URL validation
        if (!imageUrl.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)$/i) && 
            !imageUrl.includes('cdn.discordapp.com') && 
            !imageUrl.includes('imgur.com') &&
            !imageUrl.includes('gyazo.com')) {
            return message.reply('❌ Please provide a valid image URL.\n\n**Supported:**\n• Direct image links (.jpg, .png, .gif, etc.)\n• Discord CDN links\n• Imgur links\n• Gyazo links');
        }

        try {
            // Test if the image is accessible
            const fetch = require('node-fetch');
            const response = await fetch(imageUrl, { method: 'HEAD' });
            
            if (!response.ok) {
                return message.reply('❌ Image URL is not accessible. Please check the link and try again.');
            }

            // Set presence with custom image and enhanced activity
            await client.user.setPresence({
                activities: [{
                    name: statusText,
                    type: 'CUSTOM',
                    state: statusText,
                    assets: {
                        largeImage: imageUrl,
                        largeText: statusText,
                        smallImage: 'https://cdn.discordapp.com/emojis/853569421054984233.png', // Optional small icon
                        smallText: 'Custom Status'
                    },
                    timestamps: {
                        start: Date.now() // Shows "for X minutes" 
                    }
                }],
                status: 'online'
            });

            // Stop any existing status rotation
            if (client.statusRotation) {
                clearInterval(client.statusRotation);
                client.statusRotation = null;
                console.log('🔄 Status rotation stopped due to custom image status');
            }

            await message.reply(`✅ **Custom image status set!**\n\n🖼️ **Image:** ${imageUrl}\n💬 **Text:** ${statusText}\n⏰ **Timer:** Started\n\n*Use \`!stopstatus\` to reset or \`!astatus\` for random animated statuses.*`);

        } catch (error) {
            console.error('Error setting status with image:', error);
            
            if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
                await message.reply('❌ Cannot reach the image URL. Please check your internet connection or try a different URL.');
            } else if (error.message.includes('Invalid Form Body')) {
                await message.reply('❌ Invalid image format or URL. Discord only supports certain image formats.');
            } else {
                await message.reply('❌ Failed to set status with image. Please try again with a different image URL.');
            }
        }
    }
};
