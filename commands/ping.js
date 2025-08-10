module.exports = {

  name: 'ping',

  description: 'Checks the bot\'s latency.',

  async execute(message, args, client) {

    const sent = await message.channel.send('Pinging...');

    const wsPing = client.ws.ping;

    const roundTrip = sent.createdTimestamp - message.createdTimestamp;

    await sent.edit(`Pong! WebSocket: ${wsPing}ms | Round-trip: ${roundTrip}ms`);

  }

};