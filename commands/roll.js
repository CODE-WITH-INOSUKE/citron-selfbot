module.exports = {
    name: 'roll',
    description: 'Roll a random number from 1 to 100',
    async execute(message, args, client) {
        try {
            const number = Math.floor(Math.random() * 100) + 1;
            await message.channel.send(`🎲 You rolled: **${number}**`);
        } catch (error) {
            console.error('Roll command error:', error);
            await message.channel.send('Error rolling the dice.');
        }
    }
};