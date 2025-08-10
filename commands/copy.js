const { Client } = require('discord.js-selfbot-v13');
const fs = require('fs');
const configPath = './copyConfig.json';

module.exports = {
  name: 'copy',
  description: 'Copies new messages from a source channel to a destination channel in real-time using a single webhook that mimics the author’s name and avatar. Usage: !copy <source_channel_id> <destination_channel_id>',
  async execute(message, args, client) {
    // Validate arguments
    if (args.length !== 2) {
      return message.reply('📋 Usage: !copy <source_channel_id> <destination_channel_id>');
    }

    const sourceChannelId = args[0];
    const destinationChannelId = args[1];

    // Validate channel IDs
    if (!/^\d+$/.test(sourceChannelId) || !/^\d+$/.test(destinationChannelId)) {
      return message.reply('❌ Please provide valid channel IDs.');
    }

    try {
      // Fetch channels
      const sourceChannel = await client.channels.fetch(sourceChannelId);
      const destinationChannel = await client.channels.fetch(destinationChannelId);

      // Check if channels are accessible
      if (!sourceChannel || !destinationChannel) {
        return message.reply('❌ One or both channels are inaccessible.');
      }

      // Check if source channel is text-based
      if (!['GUILD_TEXT', 'DM', 'GROUP_DM'].includes(sourceChannel.type)) {
        return message.reply('❌ Source channel must be text-based (server text, DM, or group DM).');
      }

      // Check if destination channel is a server text channel (webhooks require GUILD_TEXT)
      if (destinationChannel.type !== 'GUILD_TEXT') {
        return message.reply('❌ Destination channel must be a server text channel (webhooks are not supported in DMs or group DMs).');
      }

      // Check permissions for sending messages and managing webhooks
      if (!destinationChannel.permissionsFor(client.user).has(['SEND_MESSAGES', 'MANAGE_WEBHOOKS'])) {
        return message.reply('❌ I lack permission to send messages or manage webhooks in the destination channel.');
      }

      // Load or initialize config
      let config = {};
      if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      }
      if (!config.copies) config.copies = [];

      // Save channel pair if not already present
      if (!config.copies.some(c => c.source === sourceChannelId && c.destination === destinationChannelId)) {
        config.copies.push({ source: sourceChannelId, destination: destinationChannelId });
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      }

      // Notify user that copying has started
      await message.channel.send(`✅ Started copying new messages from <#${sourceChannelId}> to <#${destinationChannelId}> using a webhook.`);

      // Get or create a single webhook for the destination channel
      let webhook;
      const webhooks = await destinationChannel.fetchWebhooks();
      webhook = webhooks.find(w => w.owner.id === client.user.id) || await destinationChannel.createWebhook(`CopyBot-${client.user.username}`, {
        avatar: client.user.avatarURL(),
        reason: 'Created for real-time message copying',
      });

      // Store webhook ID in config for this destination
      config.webhooks = config.webhooks || {};
      config.webhooks[destinationChannelId] = { id: webhook.id, token: webhook.token };
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      // Listen for new messages in the source channel
      client.on('messageCreate', async (msg) => {
        try {
          // Only process messages from the source channel
          if (msg.channel.id !== sourceChannelId) return;

          // Ignore messages from bots, including the self-bot
          if (msg.author.bot || msg.author.id === client.user.id) return;

          // Sanitize message content and fix mentions
          let content = msg.content || '';
          if (typeof content === 'string') {
            content = content.replace(/[^\p{L}\p{N}\p{P}\p{Z}]/gu, ''); // Remove invalid Unicode
            // Convert @userID to <@userID>
            content = content.replace(/@(\d+)/g, '<@$1>');
          } else {
            content = String(content);
          }

          // Update webhook’s name and avatar to match the message author
          await webhook.edit({
            name: msg.author.username,
            avatar: msg.author.avatarURL() || msg.author.defaultAvatarURL,
            reason: `Updated to mimic ${msg.author.username} for message copying`,
          });

          // Prepare webhook message options to copy the message exactly
          const webhookOptions = {
            content: content || undefined,
            embeds: msg.embeds.length > 0 ? msg.embeds : undefined,
            files: msg.attachments.size > 0 ? msg.attachments.map(a => a.url) : undefined,
          };

          // Send message via webhook
          await webhook.send(webhookOptions);

          // Delay to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error('Error copying message:', error);
          await message.channel.send(`❌ Error copying a message: ${error.message}`);
        }
      });
    } catch (error) {
      console.error('Copy Command Error:', error);
      await message.reply(`❌ Error setting up copy: ${error.message}`);
    }
  },
};