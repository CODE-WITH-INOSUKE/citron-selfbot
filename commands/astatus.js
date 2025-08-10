module.exports = {
    name: 'astatus',
    description: 'Set animated status that cycles through different quotes every 5 seconds.',
    async execute(message, args, client) {
        // Array of animated status quotes and activities
        const animatedStatuses = [
            {
                text: "🎵 vibing to the music",
                type: "LISTENING"
            },
            {
                text: "🎮 conquering worlds",
                type: "PLAYING"
            },
            {
                text: "📱 scrolling endlessly",
                type: "CUSTOM"
            },
            {
                text: "💭 thinking deep thoughts",
                type: "CUSTOM"
            },
            {
                text: "🌟 being awesome",
                type: "CUSTOM"
            },
            {
                text: "🔥 setting trends",
                type: "CUSTOM"
            },
            {
                text: "⚡ charging up",
                type: "CUSTOM"
            },
            {
                text: "🚀 reaching for stars",
                type: "CUSTOM"
            },
            {
                text: "💎 shining bright",
                type: "CUSTOM"
            },
            {
                text: "🎭 living the dream",
                type: "CUSTOM"
            },
            {
                text: "🎨 creating magic",
                type: "CUSTOM"
            },
            {
                text: "🌈 spreading positivity",
                type: "CUSTOM"
            },
            {
                text: "⭐ being legendary",
                type: "CUSTOM"
            },
            {
                text: "🎪 enjoying the chaos",
                type: "CUSTOM"
            },
            {
                text: "🦋 transforming daily",
                type: "CUSTOM"
            },
            {
                text: "🌊 riding the waves",
                type: "CUSTOM"
            },
            {
                text: "🔮 manifesting dreams",
                type: "CUSTOM"
            },
            {
                text: "🎯 hitting all targets",
                type: "CUSTOM"
            },
            {
                text: "💫 creating stardust",
                type: "CUSTOM"
            },
            {
                text: "🌙 dreaming while awake",
                type: "CUSTOM"
            },
            {
                text: "🎊 celebrating existence",
                type: "CUSTOM"
            },
            {
                text: "🏆 winning at life",
                type: "CUSTOM"
            },
            {
                text: "🎲 taking chances",
                type: "CUSTOM"
            },
            {
                text: "🌺 blooming beautifully",
                type: "CUSTOM"
            },
            {
                text: "⚖️ balancing chaos",
                type: "CUSTOM"
            },
            {
                text: "🎬 directing my story",
                type: "WATCHING"
            },
            {
                text: "📚 learning new things",
                type: "CUSTOM"
            },
            {
                text: "🎹 composing my life",
                type: "LISTENING"
            },
            {
                text: "🚁 hovering above drama",
                type: "CUSTOM"
            },
            {
                text: "🎪 juggling responsibilities",
                type: "CUSTOM"
            },
            {
                text: "🌀 spinning with energy",
                type: "CUSTOM"
            },
            {
                text: "💝 spreading good vibes",
                type: "CUSTOM"
            },
            {
                text: "🎨 painting my future",
                type: "CUSTOM"
            },
            {
                text: "🔊 amplifying positivity",
                type: "CUSTOM"
            },
            {
                text: "🎭 performing miracles",
                type: "CUSTOM"
            },
            {
                text: "🌟 illuminating darkness",
                type: "CUSTOM"
            },
            {
                text: "🎵 dancing through life",
                type: "LISTENING"
            },
            {
                text: "🎮 level up mode",
                type: "PLAYING"
            },
            {
                text: "🚀 mission possible",
                type: "CUSTOM"
            },
            {
                text: "💎 rare and valuable",
                type: "CUSTOM"
            },
            {
                text: "🎯 focused on greatness",
                type: "CUSTOM"
            },
            {
                text: "🌈 chasing rainbows",
                type: "CUSTOM"
            },
            {
                text: "⚡ electric personality",
                type: "CUSTOM"
            },
            {
                text: "🎊 party mode activated",
                type: "CUSTOM"
            },
            {
                text: "🔥 burning bright",
                type: "CUSTOM"
            },
            {
                text: "🌙 night owl vibes",
                type: "CUSTOM"
            },
            {
                text: "☀️ sunshine energy",
                type: "CUSTOM"
            },
            {
                text: "🎪 master of ceremonies",
                type: "CUSTOM"
            },
            {
                text: "🌊 making waves",
                type: "CUSTOM"
            },
            {
                text: "🎭 plot twist incoming",
                type: "CUSTOM"
            },
            {
                text: "💫 cosmic wanderer",
                type: "CUSTOM"
            }
        ];

        try {
            // Stop any existing status rotation
            if (client.statusRotation) {
                clearInterval(client.statusRotation);
                client.statusRotation = null;
                console.log('🔄 Previous status rotation stopped');
            }

            // Select first random status
            let currentIndex = Math.floor(Math.random() * animatedStatuses.length);
            let currentStatus = animatedStatuses[currentIndex];
            
            // Set initial status
            await client.user.setPresence({
                activities: [{
                    name: currentStatus.text,
                    type: currentStatus.type,
                    state: currentStatus.text
                }],
                status: 'online'
            });

            // Send confirmation message
            await message.reply(`🎭 **Animated Status Cycling Started!**\n⏱️ **Interval:** Every 5 seconds\n🎯 **Total Statuses:** ${animatedStatuses.length}\n💬 **Current:** ${currentStatus.text}\n\n*Use \`!stopstatus\` to stop cycling*`);

            // Start cycling through statuses every 5 seconds
            client.statusRotation = setInterval(async () => {
                try {
                    // Move to next status (sequential cycling)
                    currentIndex = (currentIndex + 1) % animatedStatuses.length;
                    currentStatus = animatedStatuses[currentIndex];

                    await client.user.setPresence({
                        activities: [{
                            name: currentStatus.text,
                            type: currentStatus.type,
                            state: currentStatus.text
                        }],
                        status: 'online'
                    });

                    console.log(`🔄 Status cycled to: ${currentStatus.text}`);
                } catch (error) {
                    console.error('Status cycling error:', error);
                }
            }, 5000); // 5 seconds = 5000ms

            console.log('🎭 Animated status cycling started with 5-second intervals');

        } catch (error) {
            console.error('Error setting animated status cycling:', error);
            await message.reply('❌ Failed to start animated status cycling. Please try again.');
        }
    }
};
