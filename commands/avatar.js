module.exports = {

  name: 'avatar',

  description: 'Displays the avatar of a mentioned user or yourself.',

  async execute(message, args, client) {

    const user = message.mentions.users.first() || message.author;

    const avatar = user.avatarURL({ size: 512, dynamic: true });

    if (!avatar) {

      return message.reply('No avatar found for this user.');

    }

    await message.channel.send(avatar);

  }

};