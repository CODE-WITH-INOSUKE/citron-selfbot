const sqlite3 = require('sqlite3').verbose();

module.exports = {
    name: 'autorespond',
    description: 'Set an autorespond trigger (!autorespond word/sentence "response")',
    async execute(message, args, client) {
        // Join all arguments and use regex to split trigger and quoted response
        const input = args.join(' ');
        const match = input.match(/^(.+?)\s+"(.+)"$/);
        
        if (!match) {
            return message.channel.send('Please provide a trigger word/sentence followed by a response in quotes (!autorespond word "response").');
        }

        try {
            const trigger = match[1].trim().toLowerCase();
            const response = match[2].trim();
            
            if (!trigger || !response) {
                return message.channel.send('Please provide a valid trigger word/sentence and response.');
            }

            const db = new sqlite3.Database('./database.db');
            db.run(
                `INSERT OR REPLACE INTO autorespond_settings (channel_id, trigger, response) VALUES (?, ?, ?)`,
                [message.channel.id, trigger, response],
                (err) => {
                    if (err) {
                        console.error('Autorespond command database error:', err);
                        message.channel.send('Error setting autorespond.');
                    } else {
                        message.channel.send(`Autorespond set: "${trigger}" → "${response}"`);
                    }
                    db.close();
                }
            );
        } catch (error) {
            console.error('Autorespond command error:', error);
            await message.channel.send('Error processing autorespond command.');
        }
    }
};