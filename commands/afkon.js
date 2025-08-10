const sqlite3 = require('sqlite3').verbose();

module.exports = {
    name: 'afkon',
    description: 'Set AFK status with an optional message',
    async execute(message, args, client) {
        try {
            const afkMessage = args.length ? args.join(' ') : 'I am AFK';
            const db = new sqlite3.Database('./database.db');
            db.run(
                `INSERT OR REPLACE INTO afk_settings (user_id, afk_message) VALUES (?, ?)`,
                [message.author.id, afkMessage],
                (err) => {
                    if (err) {
                        console.error('AFKON command database error:', err);
                        message.channel.send('Error setting AFK status.');
                    } else {
                        message.channel.send(`AFK status set: ${afkMessage}`);
                    }
                    db.close();
                }
            );
        } catch (error) {
            console.error('AFKON command error:', error);
            await message.channel.send('Error processing AFKON command.');
        }
    }
};