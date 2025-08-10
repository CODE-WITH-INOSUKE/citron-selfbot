const QRCode = require('qrcode');
const { MessageAttachment } = require('discord.js-selfbot-v13');

module.exports = {
  name: 'qr',
  description: 'Generates and sends a QR code image from the given text.',
  async execute(message, args, client) {
    if (!args.length) {
      return message.reply('Please provide text to encode as a QR code.');
    }
    const text = args.join(' ');

    try {
      // Generate QR code as a data URL
      const qrDataUrl = await QRCode.toDataURL(text, { errorCorrectionLevel: 'H' });

      // Convert data URL to buffer
      const base64 = qrDataUrl.split(',')[1];
      const buffer = Buffer.from(base64, 'base64');

      const attachment = new MessageAttachment(buffer, 'qr.png');
      await message.channel.send({ files: [attachment] });
    } catch (err) {
      console.error('QR code error:', err);
      await message.channel.send('Error generating QR code.');
    }
  },
};
