module.exports = {

  name: 'servericon',

  description: 'Displays the server icon of the current guild.',

  async execute(message, args, client) {

    if (!message.guild) {

      return message.channel.send('This command can only be used in a server.');

    }

    const icon = message.guild.iconURL({ size: 512, dynamic: true });

    if (!icon) {

      return message.reply('This server has no icon.');

    }

    await message.reply(icon);

  }

};