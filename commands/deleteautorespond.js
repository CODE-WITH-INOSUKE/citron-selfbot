const sqlite3 = require('sqlite3').verbose();

module.exports = {
    name: 'deleteautorespond',
    description: 'Delete an autorespond trigger (!deleteautorespond word/sentence)',
    async execute(message, args, client) {
        if (!args.length) {
            return message.channel.send('Please provide the trigger word/sentence to delete (!deleteautorespond word).');
        }

        try {
            const trigger = args.join(' ').toLowerCase();
            const db = new sqlite3.Database('./database.db');
            db.run(
                `DELETE FROM autorespond_settings WHERE channel_id = ? AND trigger = ?`,
                [message.channel.id, trigger],
                function (err) {
                    if (err) {
                        console.error('Deleteautorespond command database error:', err);
                        message.channel.send('Error deleting autorespond trigger.');
                    } else if (this.changes === 0) {
                        message.channel.send(`No autorespond trigger found for "${trigger}".`);
                    } else {
                        message.channel.send(`Autorespond trigger "${trigger}" deleted.`);
                    }
                    db.close();
                }
            );
        } catch (error) {
            console.error('Deleteautorespond command error:', error);
            await message.channel.send('Error processing deleteautorespond command.');
        }
    }
};