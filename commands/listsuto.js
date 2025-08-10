const sqlite3 = require('sqlite3').verbose();

module.exports = {
    name: 'listauto',
    description: 'List all autoreact and autorespond triggers for the current channel',
    async execute(message, args, client) {
        try {
            const db = new sqlite3.Database('./database.db');
            
            // Get autoreact triggers
            const autoreacts = await new Promise((resolve, reject) => {
                db.all(
                    `SELECT trigger, emoji FROM autoreact_settings WHERE channel_id = ?`,
                    [message.channel.id],
                    (err, rows) => {
                        if (err) reject(err);
                        resolve(rows);
                    }
                );
            });

            // Get autorespond triggers
            const autoresponds = await new Promise((resolve, reject) => {
                db.all(
                    `SELECT trigger, response FROM autorespond_settings WHERE channel_id = ?`,
                    [message.channel.id],
                    (err, rows) => {
                        if (err) reject(err);
                        resolve(rows);
                    }
                );
            });

            let output = 'Autoreact Triggers:\n';
            output += autoreacts.length
                ? autoreacts.map(row => `  "${row.trigger}" → ${row.emoji}`).join('\n')
                : '  None';

            output += '\n\nAutorespond Triggers:\n';
            output += autoresponds.length
                ? autoresponds.map(row => `  "${row.trigger}" → "${row.response}"`).join('\n')
                : '  None';

            await message.channel.send(`\`\`\`\n${output}\n\`\`\``);
            db.close();
        } catch (error) {
            console.error('Listauto command error:', error);
            await message.channel.send('Error listing autoreact and autorespond triggers.');
        }
    }
};