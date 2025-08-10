const sqlite3 = require('sqlite3').verbose();

module.exports = {
    name: 'aion',
    description: 'Enable AI responses in the current channel',
    async execute(message, args, client) {
        const db = new sqlite3.Database('./database.db');
        db.run(
            `INSERT OR REPLACE INTO ai_settings (channel_id, ai_enabled) VALUES (?, ?)`,
            [message.channel.id, true],
            (err) => {
                if (err) {
                    console.error('Database error:', err);
                    return message.channel.send('Error enabling AI.');
                }
                message.channel.send('AI responses enabled in this channel.');
            }
        );
        db.close();
    }
};