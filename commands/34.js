const axios = require('axios');

module.exports = {

  name: '34',

  description: 'Fetches images from Rule34 API. Usage: !34 <query> <amount 1-10>',

  async execute(message, args, client) {

    // Validate arguments

    if (!args[0]) {

      return message.reply('🔍 Please provide a search query (e.g., !34 anime 5).');

    }

    const query = args.slice(0, -1).join(' ');

    const amount = parseInt(args[args.length - 1]);

    if (isNaN(amount) || amount < 1 || amount > 10) {

      return message.reply('📏 Please provide a valid amount between 1 and 10.');

    }

    try {

      // Fetch from Rule34 API

      const response = await axios.get(`https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&tags=${encodeURIComponent(query)}&limit=${amount}&json=1`);

      const posts = response.data;

      if (!posts || posts.length === 0) {

        return message.reply('😔 No images found for that query.');

      }

      // Send image URLs

      const imageUrls = posts.map(post => post.file_url).slice(0, amount);

      for (const url of imageUrls) {

        await message.channel.send(`🖼️ ${url}`);

        await new Promise(resolve => setTimeout(resolve, 1000)); // Delay to avoid rate limits

      }

      await message.reply(`✅ Sent ${imageUrls.length} image(s) for "${query}".`);

    } catch (error) {

      await message.reply(`❌ Error fetching images: ${error.message}`);

    }

  }

};