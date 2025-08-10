const sqlite3 = require('sqlite3').verbose();

module.exports = {
    name: 'aioff',
    description: 'Disable AI responses in the current channel',
    async execute(message, args, client) {
        const db = new sqlite3.Database('./database.db');
        db.run(
            `INSERT OR REPLACE INTO ai_settings (channel_id, ai_enabled) VALUES (?, ?)`,
            [message.channel.id, false],
            (err) => {
                if (err) {
                    console.error('Database error:', err);
                    return message.channel.send('Error disabling AI.');
                }
                message.channel.send('AI responses disabled in this channel.');
            }
        );
        db.close();
    }
};