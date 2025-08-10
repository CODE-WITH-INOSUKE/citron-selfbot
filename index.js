const { Client } = require('discord.js-selfbot-v13');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const express = require('express');

const config = require('./config.json');
const { handleGroq } = require('./ai/groq');
const { handleGemini } = require('./ai/gemini');
const { handleNvidia } = require('./ai/nvidia');

const client = new Client({ checkUpdate: false });
client.config = config;
const app = express();

const aiConfig = require('./ai-config.json');
const rpcConfig = require('./rpc-config.json');

// === Console logs storage ===
let consoleLogs = [];
const MAX_LOGS = 200;

function addLog(type, args) {
    const entry = {
        time: new Date().toLocaleString(),
        type,
        message: args.map(a => (typeof a === 'object' ? JSON.stringify(a, null, 2) : a)).join(' ')
    };
    consoleLogs.unshift(entry);
    if (consoleLogs.length > MAX_LOGS) consoleLogs.pop();
}

// Patch console methods
['log', 'error', 'warn'].forEach((method) => {
    const orig = console[method];
    console[method] = (...args) => {
        addLog(method, args);
        orig.apply(console, args);
    };
});

// Function to read rpcConfig.json directly
function getRpcConfigFromFile() {
    const rpcPath = path.join(__dirname, 'data', 'rpcConfig.json');
    if (!fs.existsSync(rpcPath)) return null;
    
    try {
        const jsonData = fs.readFileSync(rpcPath, 'utf8');
        const rpcData = JSON.parse(jsonData);
        
        if (!rpcData.enabled) return null;
        
        // Process the config data for frontend display
        const processedRpc = {
            enabled: rpcData.enabled,
            type: rpcData.type || 'PLAYING',
            name: rpcData.name || '',
            details: rpcData.details || '',
            state: rpcData.state || '',
            applicationId: rpcData.applicationId || null,
            assets: {
                largeImage: rpcData.largeImage || rpcData.imageUrl || null,
                smallImage: rpcData.smallImage || null
            },
            rpcImageURL: null
        };
        
        // Build the image URL
        const largeImage = processedRpc.assets.largeImage;
        const appId = processedRpc.applicationId;
        
        if (largeImage) {
            if (largeImage.startsWith('mp:')) {
                // Discord media proxy URL
                processedRpc.rpcImageURL = largeImage.replace('mp:', 'https://media.discordapp.net/');
            } else if (largeImage.match(/^https?:\/\//)) {
                // Direct HTTP/HTTPS URL
                processedRpc.rpcImageURL = largeImage;
            } else if (appId) {
                // Discord application asset
                processedRpc.rpcImageURL = `https://cdn.discordapp.com/app-assets/${appId}/${largeImage}.png`;
            } else {
                processedRpc.rpcImageURL = null;
            }
        }
        
        return processedRpc;
    } catch (error) {
        console.error('Error reading rpcConfig.json:', error);
        return null;
    }
}

// Database setup
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) console.error('Database error:', err);
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS ai_settings (channel_id TEXT PRIMARY KEY, ai_enabled BOOLEAN, ai_provider TEXT DEFAULT 'groq')`);
    db.run(`CREATE TABLE IF NOT EXISTS afk_settings (user_id TEXT PRIMARY KEY, afk_message TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS autoreact_settings (channel_id TEXT, trigger TEXT, emoji TEXT, PRIMARY KEY (channel_id, trigger))`);
    db.run(`CREATE TABLE IF NOT EXISTS autorespond_settings (channel_id TEXT, trigger TEXT, response TEXT, PRIMARY KEY (channel_id, trigger))`);
});

// Ensure necessary folder
fs.mkdir(path.join(__dirname, 'database/notes'), { recursive: true }, (err) => {
    if (err) console.error('Error creating notes directory:', err);
});

// Load all commands
const commands = new Map();
fs.readdirSync('./commands')
  .filter(file => file.endsWith('.js'))
  .forEach(file => {
      const cmd = require(`./commands/${file}`);
      commands.set(cmd.name, cmd);
  });

const knowledge = require('./knowledge.js');

// Web dashboard config
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'dashboard/views'));
app.use(express.static(path.join(__dirname, 'dashboard/public')));
app.use(express.json());

// Dashboard route - now reads from rpcConfig.json directly
app.get('/', async (req, res) => {
    try {
        // Get RPC data directly from rpcConfig.json file
        const rpcStatus = getRpcConfigFromFile();
        
        res.render('index', {
            botStatus: client.isReady(),
            username: client.user?.username || 'Offline',
            discriminator: client.user?.discriminator || '0000',
            userId: client.user?.id || 'Unknown',
            userAvatar: client.user?.displayAvatarURL() || null,
            accountCreated: client.user?.createdAt?.toLocaleDateString() || 'Unknown',
            uptime: process.uptime() ? new Date(process.uptime()*1000).toISOString().substr(11,8) : '00:00:00',
            commandsUsed: client.commandsUsed || 0,
            activeFeatures: 5,

            userBio: client.user?.about || 'No bio set',
            bioCycling: !!client.bioRotation,

            // RPC data from file instead of live presence
            rpcStatus: rpcStatus,

            aiEnabled: true,
            statusCycling: !!client.statusRotation,
            autoReact: true,
            afkMode: false
        });
    } catch (err) {
        console.error(err);
        res.render('index', { 
            botStatus: false, 
            username: 'Error loading',
            rpcStatus: null 
        });
    }
});

// Console route
app.get('/console', (req, res) => {
    res.render('console', { logs: consoleLogs });
});

app.get('/commands', (req, res) => {
    res.render('commands', { commands: Array.from(commands.values()) });
});

app.post('/toggle-ai/:channelId', async (req, res) => {
    const { channelId } = req.params;
    const { enabled } = req.body;
    db.run(
        `INSERT OR REPLACE INTO ai_settings (channel_id, ai_enabled, ai_provider)
        VALUES (?, ?, COALESCE((SELECT ai_provider FROM ai_settings WHERE channel_id = ?), 'groq'))`,
        [channelId, enabled, channelId],
        err => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json({ success: true });
        }
    );
});

app.listen(config.port, () => {
    console.log(`Dashboard: http://localhost:${config.port}`);
});

// READY
client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
    try {
        const rpcPath = path.join(__dirname, 'data', 'rpcConfig.json');
        if (fs.existsSync(rpcPath)) {
            const rpcData = JSON.parse(fs.readFileSync(rpcPath, 'utf8'));
            if (rpcData.enabled && rpcData.type && rpcData.name) {
                const activity = { name: rpcData.name, type: rpcData.type, state: rpcData.type==='CUSTOM' ? rpcData.name : undefined };
                if (rpcData.imageUrl) activity.assets = { largeImage: rpcData.imageUrl, largeText: rpcData.name };
                if (rpcData.type === 'STREAMING') activity.url = 'https://twitch.tv/discord';
                await client.user.setPresence({ activities: [activity], status: 'online' });
            }
        }
    } catch (err) {
        console.error('RPC load error:', err);
    }
});

// MESSAGE
client.on('messageCreate', async (message) => {
    if (!config.allowedUserIds.includes(message.author.id)) return;

    // Disable AFK on message
    db.get(`SELECT afk_message FROM afk_settings WHERE user_id=?`, [message.author.id], (err, row) => {
        if (row) {
            db.run(`DELETE FROM afk_settings WHERE user_id=?`, [message.author.id]);
            message.channel.send('Your AFK status has been disabled.');
        }
    });

    // Commands
    if (message.content.startsWith(config.prefix)) {
        const args = message.content.slice(config.prefix.length).trim().split(/ +/);
        const cmdName = args.shift().toLowerCase();
        if (commands.has(cmdName)) {
            try {
                client.commandsUsed = (client.commandsUsed || 0) + 1;
                await commands.get(cmdName).execute(message, args, client);
                if (message.author.id !== config.allowedUserIds[0]) await message.delete().catch(() => {});
            } catch (err) {
                console.error(`Cmd ${cmdName} error:`, err);
                message.channel.send('Error executing command.');
            }
        }
        return;
    }

    // AFK mentions
    for (const u of message.mentions.users.values()) {
        if (u.id !== client.user.id) {
            db.get(`SELECT afk_message FROM afk_settings WHERE user_id=?`, [u.id], (err, row) => {
                if (row) message.channel.send(`${u.tag} is AFK: ${row.afk_message}`);
            });
        }
    }

    // Autoreact
    db.all(`SELECT trigger, emoji FROM autoreact_settings WHERE channel_id=?`, [message.channel.id], (err, rows) => {
        for (const r of rows) if (message.content.toLowerCase().includes(r.trigger)) message.react(r.emoji).catch(()=>{});
    });

    // Autorespond
    db.all(`SELECT trigger, response FROM autorespond_settings WHERE channel_id=?`, [message.channel.id], (err, rows) => {
        for (const r of rows) if (message.content.toLowerCase().includes(r.trigger)) message.channel.send(r.response).catch(()=>{});
    });

    // Copycat
    if (client.copycatTargets?.has(message.author.id)) {
        const data = client.copycatTargets.get(message.author.id);
        if (message.channel.id === data.channelId) setTimeout(() => message.channel.send(message.content), 1000+Math.random()*2000);
    }
    // Autoreply
    if (client.autoreplies?.has(message.author.id) && message.author.id !== client.user.id) {
        const data = client.autoreplies.get(message.author.id);
        if (message.channel.id === data.channelId) setTimeout(()=>message.channel.send(data.replyMessage), 2000+Math.random()*3000);
    }

    // AI
    db.get(`SELECT ai_enabled, ai_provider FROM ai_settings WHERE channel_id=?`, [message.channel.id], async (err, row) => {
        if (row?.ai_enabled && message.author.id !== client.user.id) {
            const isMention = message.mentions.users.has(client.user.id);
            const isReply = message.reference && (await message.channel.messages.fetch(message.reference.messageId)).author.id === client.user.id;
            if (isMention || isReply) {
                try {
                    let resp;
                    if (message.attachments.size > 0) resp = await handleGemini(message, aiConfig, knowledge);
                    else resp = row.ai_provider === 'nvidia'
                        ? await handleNvidia(message, aiConfig, knowledge)
                        : await handleGroq(message, aiConfig, knowledge);
                    await message.channel.send(resp);
                } catch {
                    await message.channel.send('Error processing AI.');
                }
            }
        }
    });
});

// Cleanup on close
client.on('close', () => {
    if (client.alarms) { for (const [, t] of client.alarms) clearTimeout(t); client.alarms.clear(); }
    if (client.statusRotation) clearInterval(client.statusRotation);
    if (client.bioRotation) clearInterval(client.bioRotation);
    if (client.helpReactions) client.helpReactions.clear();
    if (client.quoteReactions) client.quoteReactions.clear();
    if (client.copycatTargets) client.copycatTargets.clear();
    if (client.autoreplies) client.autoreplies.clear();
});

client.login(config.token);
