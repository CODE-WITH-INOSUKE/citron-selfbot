const axios = require('axios');

module.exports = {
  name: 'iplookup',
  description: 'Looks up details for an IP address. Usage: !iplookup <ip>',

  async execute(message, args, client) {
    if (!args[0]) {
      return message.channel.send('Please provide an IP address (e.g., 8.8.8.8).');
    }

    const ip = args[0];

    try {
      const response = await axios.get(`http://ip-api.com/json/${ip}`);

      if (response.data.status === 'fail') {
        return message.channel.send('Invalid IP address.');
      }

      const { query, country, city, isp, org } = response.data;

      await message.channel.send(
        '```' +
        `\nIP: ${query}` +
        `\nCountry: ${country}` +
        `\nCity: ${city}` +
        `\nISP: ${isp}` +
        `\nOrganization: ${org || 'N/A'}` +
        '\n```'
      );

    } catch (error) {
      await message.channel.send('Failed to lookup IP address. Please try again.');
    }
  }
};