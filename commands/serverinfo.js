module.exports = {

  name: 'serverinfo',

  description: 'Displays information about the current server.',

  async execute(message, args, client) {

    if (!message.guild) {

      return message.reply('This command can only be used in a server.');

    }

    try {

      const guild = message.guild;

      const owner = await guild.fetchOwner();

      const info = [

        `**Server Name**: ${guild.name}`,

        `**Owner**: ${owner.user.username}`, // Username only, no ping

        `**Members**: ${guild.memberCount}`,

        `**Channels**: ${guild.channels.cache.size}`,

        `**Created**: ${guild.createdAt.toDateString()}`,

        `**ID**: ${guild.id}`

      ].join('\n');

      await message.reply(info);

    } catch (error) {

      await message.reply(`Failed to fetch server info: ${error.message}`);

    }

  }

};