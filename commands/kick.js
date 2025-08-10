module.exports = {

  name: 'kick',

  description: 'Kicks a mentioned user from the server. Usage: !kick @user [reason]',

  async execute(message, args, client) {

    if (!message.guild) {

      return message.reply('This command can only be used in a server.');

    }

    if (!message.member.permissions.has('KICK_MEMBERS')) {

      return message.reply('You do not have permission to kick members.');

    }

    const user = message.mentions.users.first();

    if (!user) {

      return message.reply('Please mention a user to kick.');

    }

    const reason = args.slice(1).join(' ') || 'No reason provided';

    try {

      const member = await message.guild.members.fetch(user);

      await member.kick(reason);

      await message.reply(`Kicked ${user.username} for: ${reason}`);

    } catch (error) {

      await message.reply(`Failed to kick ${user.username}: ${error.message}`);

    }

  }

};