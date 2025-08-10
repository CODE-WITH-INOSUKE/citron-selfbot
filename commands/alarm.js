module.exports = {
    name: 'alarm',
    description: 'Set an alarm to ping after a time (!alarm <time><m/h/s>)',
    async execute(message, args, client) {
        if (!args[0]) {
            return message.channel.send('Please provide a time and unit (!alarm 5m, !alarm 2h, !alarm 30s).');
        }

        const input = args[0].match(/^(\d+)([mhs])$/);
        if (!input) {
            return message.channel.send('Invalid format. Use <number><m/h/s> (e.g., 5m for 5 minutes).');
        }

        try {
            const time = parseInt(input[1], 10);
            const unit = input[2];
            let milliseconds;

            if (unit === 'm') milliseconds = time * 60 * 1000;
            else if (unit === 'h') milliseconds = time * 60 * 60 * 1000;
            else if (unit === 's') milliseconds = time * 1000;

            await message.channel.send(`Alarm set for ${time}${unit}. I’ll ping you after ${time} ${unit === 'm' ? 'minute(s)' : unit === 'h' ? 'hour(s)' : 'second(s)'}.`);

            client.alarms = client.alarms || new Map();
            client.alarms.set(message.author.id, setTimeout(async () => {
                try {
                    await message.channel.send(`${message.author.toString()}, your alarm for ${time}${unit} is up!`);
                    client.alarms.delete(message.author.id);
                } catch (error) {
                    console.error('Alarm error:', error);
                }
            }, milliseconds));
        } catch (error) {
            console.error('Alarm command error:', error);
            await message.channel.send('Error setting alarm.');
        }
    }
};