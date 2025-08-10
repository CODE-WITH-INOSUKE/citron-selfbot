module.exports = {

  name: 'ban',

  description: 'Bans a mentioned user from the server. Usage: !ban @user [reason]',

  async execute(message, args, client) {

    if (!message.guild) {

      return message.reply('This command can only be used in a server.');

    }

    if (!message.member.permissions.has('BAN_MEMBERS')) {

      return message.reply('You do not have permission to ban members.');

    }

    const user = message.mentions.users.first();

    if (!user) {

      return message.reply('Please mention a user to ban.');

    }

    const reason = args.slice(1).join(' ') || 'No reason provided';

    try {

      await message.guild.members.ban(user, { reason });

      await message.channel.send(`Banned ${user.username} for: ${reason}`);

    } catch (error) {

      await message.channel.send(`Failed to ban ${user.username}: ${error.message}`);

    }

  }

};