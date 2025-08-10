const sqlite3 = require('sqlite3').verbose();

module.exports = {
    name: 'autoreact',
    description: 'Set an autoreact trigger (!autoreact word/sentence emoji)',
    async execute(message, args, client) {
        if (args.length < 2) {
            return message.channel.send('Please provide a trigger word/sentence and an emoji (!autoreact word emoji).');
        }

        try {
            const emoji = args.pop();
            const trigger = args.join(' ').toLowerCase();
            const db = new sqlite3.Database('./database.db');
            db.run(
                `INSERT OR REPLACE INTO autoreact_settings (channel_id, trigger, emoji) VALUES (?, ?, ?)`,
                [message.channel.id, trigger, emoji],
                (err) => {
                    if (err) {
                        console.error('Autoreact command database error:', err);
                        message.channel.send('Error setting autoreact.');
                    } else {
                        message.channel.send(`Autoreact set: "${trigger}" → ${emoji}`);
                    }
                    db.close();
                }
            );
        } catch (error) {
            console.error('Autoreact command error:', error);
            await message.channel.send('Error processing autoreact command.');
        }
    }
};