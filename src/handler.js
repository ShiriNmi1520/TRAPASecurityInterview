const config = require('./config');
const { verifySignature, getSecret } = require('./util');
const { handleCommand, registerCommand } = require('./command');

module.exports.discord = async (event) => {
  // Fetch Discord secret from AWS Secrets Manager to update the token
  const discordSecret = await getSecret('prod/TRAPASecurityInterview/discord', 'ap-southeast-1');
  config.discord.token = JSON.parse(discordSecret).botToken;
  config.discord.applicationID = JSON.parse(discordSecret).applicationID;
  config.discord.guildId = JSON.parse(discordSecret).serverID;
  config.discord.publicKey = JSON.parse(discordSecret).publicKey;
  console.debug('event', event)

  // Verify signature first
  const verified = await verifySignature(
    event.headers['x-signature-ed25519'],
    event.headers['x-signature-timestamp'],
    event.body
  );
  console.debug('verified', verified)
  const body = JSON.parse(event.body);
  if (!verified) {
    console.debug('Blocking invalid request signature')
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Invalid request signature' }),
      headers: {
        'Content-Type': 'application/json',
      }
    };
  }

  // Reply ping
  if (body.type === 1) {
    console.debug('Replying to ping')
    return {
      statusCode: 200,
      body: JSON.stringify({ "type": 1 }),
      headers: {
        'Content-Type': 'application/json',
      }
    }
  }

  // Process commands
  return handleCommand(JSON.parse(event.body));
};

module.exports.register = async (event) => {
  const discordSecret = await getSecret('prod/TRAPASecurityInterview/discord', 'ap-southeast-1');
  config.discord.token = JSON.parse(discordSecret).botToken;
  config.discord.applicationID = JSON.parse(discordSecret).applicationID;
  config.discord.guildId = JSON.parse(discordSecret).serverID;

  // Register commands
  const registered = await registerCommand();
  if (!registered) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Register command failed' }),
      headers: {
        'Content-Type': 'application/json',
      }
    };
  } else {
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Register command success' }),
      headers: {
        'Content-Type': 'application/json',
      }
    };
  }
};
