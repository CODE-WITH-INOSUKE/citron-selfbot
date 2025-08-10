const os = require('os');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'stats',
  description: 'Displays system information, ping, and number of commands. Usage: !stats',
  
  async execute(message, args, client) {
    try {
      // System Info
      const totalMemory = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2); // GB
      const freeMemory = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);   // GB
      const usedMemory = (totalMemory - freeMemory).toFixed(2);           // GB
      const cpu = os.cpus()[0].model;
      const uptime = formatUptime(os.uptime());

      // Ping
      const sent = await message.channel.send('📡 Pinging...');
      const wsPing = client.ws.ping;
      const roundTrip = sent.createdTimestamp - message.createdTimestamp;

      // Number of Commands
      const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));
      const commandCount = commandFiles.length;

      // Format Response
      const statsMessage = [
        '```html',
        '📊 System Stats',
        `💻 CPU: ${cpu}`,
        `🧠 Memory: ${usedMemory}GB used / ${totalMemory}GB total`,
        `⏰ System Uptime: ${uptime}`,
        `📡 Ping: WebSocket: ${wsPing}ms | Round-trip: ${roundTrip}ms`,
        `📚 Commands: ${commandCount}`,
        '```'
      ].join('\n');

      await sent.edit(statsMessage);

    } catch (error) {
      await message.reply(`❌ Error fetching stats: ${error.message}`);
    }
  }
};

// Helper function to format uptime
function formatUptime(seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  seconds %= 3600 * 24;
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  return `${days}d ${hours}h ${minutes}m`;
}