const sqlite3 = require('sqlite3').verbose();

module.exports = {
    name: 'afkoff',
    description: 'Disable AFK status',
    async execute(message, args, client) {
        try {
            const db = new sqlite3.Database('./database.db');
            db.run(
                `DELETE FROM afk_settings WHERE user_id = ?`,
                [message.author.id],
                (err) => {
                    if (err) {
                        console.error('AFKOFF command database error:', err);
                        message.channel.send('Error disabling AFK status.');
                    } else {
                        message.channel.send('AFK status disabled.');
                    }
                    db.close();
                }
            );
        } catch (error) {
            console.error('AFKOFF command error:', error);
            await message.channel.send('Error processing AFKOFF command.');
        }
    }
};