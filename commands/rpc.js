const fs = require('fs');
const path = require('path');

// Config file path
const CONFIG_PATH = path.join(__dirname, '..', 'data');
const CONFIG_FILE = path.join(CONFIG_PATH, 'rpcConfig.json');

// Default config
const defaultConfig = {
    enabled: false,
    type: null,
    name: null,
    imageUrl: null
};

// Valid activity types
const VALID_TYPES = ['PLAYING', 'STREAMING', 'LISTENING', 'WATCHING', 'CUSTOM'];

// Ensure config directory exists
if (!fs.existsSync(CONFIG_PATH)) {
    fs.mkdirSync(CONFIG_PATH, { recursive: true });
}

// Load config
function loadConfig() {
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        }
    } catch (error) {
        console.error('Error loading RPC config:', error);
    }
    return { ...defaultConfig };
}

// Save config
function saveConfig(config) {
    try {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    } catch (error) {
        console.error('Error saving RPC config:', error);
    }
}

// Set Rich Presence
async function setRichPresence(client, config) {
    try {
        if (!config.enabled || !config.type || !config.name) {
            await client.user.setPresence({
                activities: [],
                status: 'online'
            });
            console.log('RPC cleared');
            return;
        }

        const activity = {
            name: config.name,
            type: config.type,
            state: config.type === 'CUSTOM' ? config.name : undefined
        };

        // Add image support
        if (config.imageUrl) {
            activity.assets = {
                largeImage: config.imageUrl,
                largeText: config.name
            };
        }

        // Special handling for streaming
        if (config.type === 'STREAMING') {
            activity.url = 'https://twitch.tv/discord';
        }

        await client.user.setPresence({
            activities: [activity],
            status: 'online'
        });

        console.log(`RPC started: ${config.type} ${config.name}`);
    } catch (error) {
        console.error('Error setting RPC:', error);
        throw error;
    }
}

module.exports = {
    name: 'rpc',
    description: 'Configure Rich Presence status. Usage: !rpc <on/off> or !rpc <type> <text> <imageURL>',
    
    async execute(message, args, client) {
        const config = loadConfig();

        // Show usage if no args
        if (args.length === 0) {
            const currentStatus = config.enabled ? 
                `**Current RPC:** ${config.type} - ${config.name}${config.imageUrl ? '\n**Image:** ' + config.imageUrl : ''}` : 
                '**Current RPC:** Disabled';

            return message.reply(`**Rich Presence Commands:**
• \`!rpc on/off\` - Enable/disable Rich Presence
• \`!rpc <type> <text> <imageURL>\` - Set custom status
• \`!rpc status\` - Show current RPC settings

**Types:** PLAYING, STREAMING, LISTENING, WATCHING, CUSTOM

**Examples:**
• \`!rpc PLAYING Grinding Owo 🐾 https://cdn.example.com/owo.png\`
• \`!rpc CUSTOM 💭 thinking deep thoughts\`
• \`!rpc LISTENING Lo-fi beats 🎵\`
• \`!rpc on\`
• \`!rpc off\`

${currentStatus}`);
        }

        const subCommand = args[0].toUpperCase();

        try {
            // Handle status command
            if (subCommand === 'STATUS') {
                if (config.enabled) {
                    return message.reply(`**Current RPC Settings:**
• **Status:** Enabled
• **Type:** ${config.type}
• **Text:** ${config.name}
• **Image:** ${config.imageUrl || 'None'}`);
                } else {
                    return message.reply('**Current RPC Settings:**\n• **Status:** Disabled');
                }
            }

            // Handle on/off commands
            if (subCommand === 'ON' || subCommand === 'OFF') {
                config.enabled = subCommand === 'ON';
                saveConfig(config);
                
                // Stop any existing status rotation
                if (client.statusRotation && subCommand === 'ON') {
                    clearInterval(client.statusRotation);
                    client.statusRotation = null;
                    console.log('🔄 Status rotation stopped due to RPC activation');
                }
                
                await setRichPresence(client, config);
                return message.reply(`✅ Rich Presence ${config.enabled ? 'enabled' : 'disabled'}`);
            }

            // Handle status setting
            if (!VALID_TYPES.includes(subCommand)) {
                return message.reply('❌ Invalid type. Use: PLAYING, STREAMING, LISTENING, WATCHING, or CUSTOM');
            }

            if (args.length < 2) {
                return message.reply('❌ Please provide status text');
            }

            // Check if last argument is an image URL
            let imageUrl = null;
            let nameArgs = args.slice(1);

            const lastArg = args[args.length - 1];
            if (lastArg.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i) || 
                lastArg.includes('cdn.discordapp.com') || 
                lastArg.includes('imgur.com')) {
                imageUrl = lastArg;
                nameArgs = args.slice(1, -1);
            }

            const name = nameArgs.join(' ');

            if (!name.trim()) {
                return message.reply('❌ Please provide status text');
            }

            // Update config
            config.type = subCommand;
            config.name = name;
            config.imageUrl = imageUrl;
            config.enabled = true;

            // Stop any existing status rotation
            if (client.statusRotation) {
                clearInterval(client.statusRotation);
                client.statusRotation = null;
                console.log('🔄 Status rotation stopped due to RPC update');
            }

            // Save and apply
            saveConfig(config);
            await setRichPresence(client, config);

            let replyMsg = `✅ **Rich Presence updated:**
• **Type:** ${config.type}
• **Text:** ${config.name}`;

            if (config.imageUrl) {
                replyMsg += `\n• **Image:** ${config.imageUrl}`;
            }

            message.reply(replyMsg);

        } catch (error) {
            console.error('Error in RPC command:', error);
            message.reply('❌ Failed to update Rich Presence. Please try again.');
        }
    }
};
