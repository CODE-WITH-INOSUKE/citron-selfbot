const sqlite3 = require('sqlite3').verbose();

module.exports = {
    name: 'api',
    description: 'Switch AI provider for text responses (groq or nvidia)',
    async execute(message, args, client) {
        if (!args[0]) {
            return message.channel.send('Please specify an AI provider: `!api groq` or `!api nvidia`.');
        }

        const provider = args[0].toLowerCase();
        if (provider !== 'groq' && provider !== 'nvidia') {
            return message.channel.send('Invalid provider. Use `groq` or `nvidia`.');
        }

        try {
            const db = new sqlite3.Database('./database.db');
            db.run(
                `INSERT OR REPLACE INTO ai_settings (channel_id, ai_enabled, ai_provider) VALUES (?, COALESCE((SELECT ai_enabled FROM ai_settings WHERE channel_id = ?), 0), ?)`,
                [message.channel.id, message.channel.id, provider],
                (err) => {
                    if (err) {
                        console.error('API command database error:', err);
                        return message.channel.send('Error switching AI provider.');
                    }
                    message.channel.send(`AI provider set to ${provider} for this channel.`);
                }
            );
            db.close();
        } catch (error) {
            console.error('API command error:', error);
            await message.channel.send('Error processing API command.');
        }
    }
};