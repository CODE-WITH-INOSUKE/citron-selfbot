const { MessageAttachment } = require('discord.js-selfbot-v13');
const path = require('path');

module.exports = {
  name: 'upi',
  description: "Sends the user's UPI QR code image.",
  async execute(message, args, client) {
    try {
      // Assuming the QR image is in ./database/upi-qr.png
      const upiQrPath = path.join(__dirname, '..', 'database', 'upi-qr.png');
      const attachment = new MessageAttachment(upiQrPath, 'upi-qr.png');
      await message.channel.send({ files: [attachment] });
    } catch (error) {
      console.error('Error sending UPI QR:', error);
      await message.channel.send('Error sending UPI QR code.');
    }
  },
};
