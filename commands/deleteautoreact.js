const sqlite3 = require('sqlite3').verbose();

module.exports = {

    name: 'deleteautoreact',

    description: 'Delete an autoreact trigger (!deleteautoreact word/sentence)',

    async execute(message, args, client) {

        if (!args.length) {

            return message.channel.send('Please provide the trigger word/sentence to delete (!deleteautoreact word).');

        }

        try {

            const trigger = args.join(' ').toLowerCase();

            const db = new sqlite3.Database('./database.db');

            db.run(

                `DELETE FROM autoreact_settings WHERE channel_id = ? AND trigger = ?`,

                [message.channel.id, trigger],

                function (err) {

                    if (err) {

                        console.error('Deleteautoreact command database error:', err);

                        message.channel.send('Error deleting autoreact trigger.');

                    } else if (this.changes === 0) {

                        message.channel.send(`No autoreact trigger found for "${trigger}".`);

                    } else {

                        message.channel.send(`Autoreact trigger "${trigger}" deleted.`);

                    }

                    db.close();

                }

            );

        } catch (error) {

            console.error('Deleteautoreact command error:', error);

            await message.channel.send('Error processing deleteautoreact command.');

        }

    }

};