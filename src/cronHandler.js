const { getSecret } = require('./util');
const { Client, GatewayIntentBits} = require('discord.js');
module.exports.cron = async (event) => {
  try {
    console.debug('Executing cron')
    console.debug('event', event)
    const discordSecret = await getSecret('prod/TRAPASecurityInterview/discord', 'ap-southeast-1')
    const discordSecretJSON = JSON.parse(discordSecret)
    const client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
    })
    await client.login(discordSecretJSON.botToken)
    console.debug('Logged in to Discord')
    const targetChannel = await client.channels.fetch(event.channel)
    console.debug('Sending message to channel', targetChannel)
    await targetChannel.send(event.message)
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Success' }),
      headers: {
        'Content-Type': 'application/json',
      }
    }
  } catch (cronError) {
    console.error('Error handling cron', cronError)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error handling cron' }),
      headers: {
        'Content-Type': 'application/json',
      }
    }
  }
}