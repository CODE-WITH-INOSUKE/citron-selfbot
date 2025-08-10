module.exports = {

  name: 'gayrate',

  description: 'Generates a humorous "gay percentage" for a user. Usage: !gayrate [@user]',

  async execute(message, args, client) {

    const user = message.mentions.users.first() || message.author;

    const percentage = Math.floor(Math.random() * 101); // 0-100%

    await message.channel.send(`${user.username}'s gay rate is ${percentage}%! 🌈 (Just for fun!)`);

  }

};