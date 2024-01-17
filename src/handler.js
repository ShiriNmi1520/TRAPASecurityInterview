const config = require('./config');
const { verifySignature, getSecret } = require('./util');
const { handleCommand, registerCommand } = require('./command');

module.exports.discord = async (event) => {
  // Fetch Discord secret from AWS Secrets Manager to update the token
  const discordSecret = await getSecret('prod/TRAPASecurityInterview/discord', 'ap-southeast-1');
  config.discord.token = JSON.parse(discordSecret).botToken;
  config.discord.applicationID = JSON.parse(discordSecret).applicationID;
  config.discord.guildId = JSON.parse(discordSecret).serverID;

  // Verify signature first
  const verified = await verifySignature(
    event.headers['x-signature-ed25519'],
    event.headers['x-signature-timestamp'],
    event.body
  );
  if (!verified) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Invalid request signature' }),
    };
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
    };
  } else {
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Register command success' }),
    };
  }
};
