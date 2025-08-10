const { createCanvas, loadImage } = require('canvas');
const { MessageAttachment } = require('discord.js-selfbot-v13');

module.exports = {
  name: 'quote',
  description: 'Generates a quote image with emoji support and color customization. React with 🎨 for colors, 🌈 for gradients.',
  async execute(message, args, client) {
    if (!args.length) {
      return message.reply('Please provide text for the quote.');
    }

    // Parse arguments
    const mentionedUser = message.mentions.users.first();
    let quoteText;
    
    if (mentionedUser) {
      quoteText = args.join(' ').replace(`<@${mentionedUser.id}>`, '').replace(`<@!${mentionedUser.id}>`, '').trim();
    } else {
      quoteText = args.join(' ');
    }

    if (!quoteText) {
      return message.reply('Please provide text for the quote.');
    }

    // Generate and send initial quote
    const quotMsg = await generateAndSendQuote(message, quoteText, mentionedUser, 'default', 'white');
    
    // Add reaction options
    await quotMsg.react('🎨'); // Color picker
    await quotMsg.react('🌈'); // Gradient picker
    
    // Store quote data for reaction handling
    if (!client.quoteReactions) client.quoteReactions = new Map();
    client.quoteReactions.set(quotMsg.id, {
      originalMessage: message,
      quoteText,
      mentionedUser,
      currentGradient: 'default',
      currentTextColor: 'white'
    });

    // Reaction listener for this specific message
    const reactionCollector = quotMsg.createReactionCollector({ 
      filter: (reaction, user) => user.id === message.author.id && ['🎨', '🌈'].includes(reaction.emoji.name),
      time: 300000 // 5 minutes
    });

    reactionCollector.on('collect', async (reaction, user) => {
      const quoteData = client.quoteReactions.get(quotMsg.id);
      if (!quoteData) return;

      if (reaction.emoji.name === '🌈') {
        // Cycle through gradients
        const gradients = ['default', 'sunset', 'ocean', 'forest', 'purple', 'fire'];
        const currentIndex = gradients.indexOf(quoteData.currentGradient);
        quoteData.currentGradient = gradients[(currentIndex + 1) % gradients.length];
      } else if (reaction.emoji.name === '🎨') {
        // Cycle through text colors
        const colors = ['white', 'black', 'gold', 'cyan', 'pink', 'lime'];
        const currentIndex = colors.indexOf(quoteData.currentTextColor);
        quoteData.currentTextColor = colors[(currentIndex + 1) % colors.length];
      }

      // Regenerate quote with new colors
      try {
        const newBuffer = await generateQuoteImage(quoteData.quoteText, quoteData.mentionedUser, quoteData.currentGradient, quoteData.currentTextColor);
        const newAttachment = new MessageAttachment(newBuffer, 'quote.png');
        await quotMsg.edit({ files: [newAttachment] });
      } catch (error) {
        console.error('Error updating quote colors:', error);
      }

      // Remove user's reaction
      try {
        await reaction.users.remove(user.id);
      } catch (err) {
        // Ignore permission errors
      }
    });

    reactionCollector.on('end', () => {
      client.quoteReactions.delete(quotMsg.id);
    });
  },
};

async function generateAndSendQuote(message, quoteText, mentionedUser, gradient, textColor) {
  try {
    const buffer = await generateQuoteImage(quoteText, mentionedUser, gradient, textColor);
    const attachment = new MessageAttachment(buffer, 'quote.png');
    return await message.channel.send({ files: [attachment] });
  } catch (error) {
    console.error('Quote generation error:', error);
    await message.channel.send('Error generating quote image.');
  }
}

async function generateQuoteImage(quoteText, mentionedUser, gradientType = 'default', textColor = 'white') {
  const canvas = createCanvas(800, 400);
  const ctx = canvas.getContext('2d');

  // Background setup
  if (mentionedUser) {
    try {
      const avatar = await loadImage(mentionedUser.displayAvatarURL({ format: 'png', size: 512 }));
      ctx.filter = 'blur(8px) brightness(0.3)';
      ctx.drawImage(avatar, 0, 0, canvas.width, canvas.height);
      ctx.filter = 'none';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } catch (err) {
      drawGradientBackground(ctx, canvas, gradientType);
    }
  } else {
    drawGradientBackground(ctx, canvas, gradientType);
  }

  // Text styling
  const textColors = {
    white: '#ffffff',
    black: '#000000',
    gold: '#ffd700',
    cyan: '#00ffff',
    pink: '#ff69b4',
    lime: '#00ff00'
  };
  ctx.fillStyle = textColors[textColor] || '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Dynamic font size
  let fontSize = 48;
  if (quoteText.length > 50) fontSize = 36;
  if (quoteText.length > 100) fontSize = 28;
  if (quoteText.length > 150) fontSize = 24;

  ctx.font = `${fontSize}px Arial, sans-serif`;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;

  // Draw quote marks
  ctx.font = `${fontSize + 20}px serif`;
  ctx.fillText('"', canvas.width / 2, 80);

  // Enhanced word wrap function with emoji support (centered alignment)
  async function wrapTextWithEmojis(text, x, y, maxWidth, lineHeight) {
    const segments = parseDiscordEmojis(text);
    const lines = [];
    let currentLine = [];
    let currentLineWidth = 0;

    for (const segment of segments) {
      if (segment.type === 'text') {
        const words = segment.content.split(' ');
        for (let i = 0; i < words.length; i++) {
          const word = words[i] + (i < words.length - 1 ? ' ' : '');
          const wordWidth = ctx.measureText(word).width;
          
          if (currentLineWidth + wordWidth > maxWidth && currentLine.length > 0) {
            lines.push([...currentLine]);
            currentLine = [];
            currentLineWidth = 0;
          }
          
          if (word.trim()) {
            currentLine.push({ type: 'text', content: word });
            currentLineWidth += wordWidth;
          }
        }
      } else if (segment.type === 'emoji') {
        const emojiWidth = fontSize;
        
        if (currentLineWidth + emojiWidth > maxWidth && currentLine.length > 0) {
          lines.push([...currentLine]);
          currentLine = [];
          currentLineWidth = 0;
        }
        
        currentLine.push(segment);
        currentLineWidth += emojiWidth;
      }
    }

    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    // Draw each line centered
    const startY = y - (lines.length - 1) * lineHeight / 2;
    
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      const lineY = startY + lineIndex * lineHeight;
      
      // Calculate total line width for centering
      let totalLineWidth = 0;
      for (const segment of line) {
        if (segment.type === 'text') {
          totalLineWidth += ctx.measureText(segment.content).width;
        } else if (segment.type === 'emoji') {
          totalLineWidth += fontSize;
        }
      }
      
      let currentX = x - totalLineWidth / 2; // Center the line
      
      for (const segment of line) {
        if (segment.type === 'text') {
          ctx.textAlign = 'left';
          ctx.fillText(segment.content, currentX, lineY);
          currentX += ctx.measureText(segment.content).width;
        } else if (segment.type === 'emoji') {
          try {
            const emojiUrl = `https://cdn.discordapp.com/emojis/${segment.id}.${segment.animated ? 'gif' : 'png'}?size=128`;
            const emojiImage = await loadImage(emojiUrl);
            ctx.drawImage(emojiImage, currentX, lineY - fontSize/2, fontSize, fontSize);
          } catch (err) {
            console.log(`Failed to load emoji ${segment.name}, using text fallback`);
            const fallbackText = `:${segment.name}:`;
            ctx.textAlign = 'left';
            ctx.fillText(fallbackText, currentX, lineY);
          }
          currentX += fontSize;
        }
      }
    }
  }

  // Draw main quote text
  ctx.font = `${fontSize}px Arial, sans-serif`;
  await wrapTextWithEmojis(quoteText, canvas.width / 2, canvas.height / 2, canvas.width - 100, fontSize + 10);

  // Closing quote
  ctx.textAlign = 'center';
  ctx.font = `${fontSize + 20}px serif`;
  ctx.fillText('"', canvas.width / 2, canvas.height - 80);

  // Attribution
  if (mentionedUser) {
    ctx.font = '24px Arial, sans-serif';
    ctx.fillStyle = textColor === 'black' ? '#333333' : '#cccccc';
    ctx.fillText(`- ${mentionedUser.username}`, canvas.width / 2, canvas.height - 40);
  }

  return canvas.toBuffer('image/png');
}

function drawGradientBackground(ctx, canvas, gradientType) {
  const gradients = {
    default: ['#667eea', '#764ba2'],
    sunset: ['#ff7e5f', '#feb47b'],
    ocean: ['#2196F3', '#00BCD4'],
    forest: ['#11998e', '#38ef7d'],
    purple: ['#667eea', '#764ba2'],
    fire: ['#ff416c', '#ff4b2b']
  };

  const [start, end] = gradients[gradientType] || gradients.default;
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, start);
  gradient.addColorStop(1, end);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function parseDiscordEmojis(text) {
  const pattern = /<a?:([a-zA-Z0-9_]+):(\d+)>/g;
  const segments = [];
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (lastIndex < match.index) {
      segments.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    segments.push({
      type: 'emoji',
      name: match[1],
      id: match[2],
      animated: match[0].startsWith('<a:')
    });
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.slice(lastIndex) });
  }

  return segments;
}
