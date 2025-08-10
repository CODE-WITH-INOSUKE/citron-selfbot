module.exports = {
  name: 'ltc',
  description: 'Sends the LTC wallet address.',
  async execute(message, args, client) {
    try {
      const address = 'your-ltc-wallet-address-here'; // Replace with your actual LTC address
      if (!address) {
        return message.channel.send('No LTC wallet address found.');
      }
      await message.channel.send(`LTC Wallet Address: ${address}`);
    } catch (error) {
      console.error('Error sending LTC address:', error);
      await message.channel.send('Error sending LTC wallet address.');
    }
  },
};
