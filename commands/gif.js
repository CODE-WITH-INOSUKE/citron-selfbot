const axios = require('axios');

module.exports = {

  name: 'gif',

  description: 'Fetches a random GIF from Giphy. Usage: !gif [query]',

  async execute(message, args, client) {

    const query = args.join(' ') || 'random';

    const giphyApiKey = 'xsBNwSedRrwrwn1ZyjVRta93i00yhpiJ'; // Add your Giphy API key to config.json or hardcode for testing

    try {

      const response = await axios.get(`https://api.giphy.com/v1/gifs/random?api_key=${giphyApiKey}&tag=${encodeURIComponent(query)}`);

      const gifUrl = response.data.data.images.original.url;

      await message.channel.send(gifUrl);

    } catch (error) {

      await message.reply('Failed to fetch GIF. Please try again.');

    }

  }

};