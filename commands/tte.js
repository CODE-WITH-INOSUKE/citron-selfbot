module.exports = {
  name: 'tte',
  description: 'Converts normal text into emoji letters. Usage: !tte hello world',
  async execute(message, args, client) {
    if (!args.length) {
      return message.reply('Please provide text to convert to emoji letters.');
    }

    const text = args.join(' ').toLowerCase();
    let emojiText = '';

    // Letter to emoji mapping
    const letterEmojis = {
      'a': '🇦', 'b': '🇧', 'c': '🇨', 'd': '🇩', 'e': '🇪', 'f': '🇫',
      'g': '🇬', 'h': '🇭', 'i': '🇮', 'j': '🇯', 'k': '🇰', 'l': '🇱',
      'm': '🇲', 'n': '🇳', 'o': '🇴', 'p': '🇵', 'q': '🇶', 'r': '🇷',
      's': '🇸', 't': '🇹', 'u': '🇺', 'v': '🇻', 'w': '🇼', 'x': '🇽',
      'y': '🇾', 'z': '🇿'
    };

    // Number to emoji mapping
    const numberEmojis = {
      '0': '0️⃣', '1': '1️⃣', '2': '2️⃣', '3': '3️⃣', '4': '4️⃣',
      '5': '5️⃣', '6': '6️⃣', '7': '7️⃣', '8': '8️⃣', '9': '9️⃣'
    };

    // Convert each character
    for (const char of text) {
      if (letterEmojis[char]) {
        emojiText += letterEmojis[char] + ' ';
      } else if (numberEmojis[char]) {
        emojiText += numberEmojis[char] + ' ';
      } else if (char === ' ') {
        emojiText += '   '; // Add extra spaces for word separation
      } else {
        // Keep special characters as is
        emojiText += char + ' ';
      }
    }

    // Check if the result is too long for Discord (2000 character limit)
    if (emojiText.length > 2000) {
      return message.reply('Text is too long to convert. Please use shorter text.');
    }

    await message.channel.send(emojiText.trim());
  },
};
