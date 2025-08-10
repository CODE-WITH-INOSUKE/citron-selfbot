const axios = require('axios');

module.exports = {

  name: 'gitsearch',

  description: 'Searches GitHub repositories. Usage: !gitsearch <query>',

  async execute(message, args, client) {

    if (!args.length) {

      return message.reply('Please provide a search query (e.g., discord bot).');

    }

    const query = args.join(' ');

    try {

      const response = await axios.get(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}`, {

        headers: { 'Accept': 'application/vnd.github.v3+json' }

      });

      const repos = response.data.items.slice(0, 3); // Limit to 3 results

      if (!repos.length) {

        return message.reply('No repositories found for that query.');

      }

      const reply = repos.map(repo => 

        `${repo.full_name}\n` +

        `Description: ${repo.description || 'N/A'}\n` +

        `URL: ${repo.html_url}\n` +

        `Stars: ${repo.stargazers_count}`

      ).join('\n\n');

      await message.reply(`GitHub Search Results:\n${reply}`);

    } catch (error) {

      await message.reply('Failed to search GitHub. Please try again.');

    }

  }

};