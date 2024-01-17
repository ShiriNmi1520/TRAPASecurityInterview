const config = require('./config')
const util = require('./util')
const axios = require('axios')

const registerCommand = () => {
  return new Promise((resolve, _reject) => {
    const commands = [
      {
        name: 'echo',
        type: 1,
        description: 'Replies with your input!',
      },
      {
        name: 'broadcast',
        type: 1,
        description: 'Create a cron job to broadcast a message to a channel',

      },
      {
        name: 'text_channel',
        type: 2,
        description: 'Create a text channel',
      },
      {
        name: 'kick',
        type: 1,
        description: 'Kick a user from the server',
      },
      {
        name: 'ban',
        type: 1,
        description: 'Mute a user from the server',
      }
    ];
    const createCommandPromises = [];
    commands.map(command => {
      createCommandPromises.push(
        axios.post(
          `https://discord.com/api/v10/applications/${config.discord.applicationID}/guilds/${config.discord.guildId}/commands`,
          command,
          {
            headers: {
              Authorization: `Bot ${config.discord.token}`,
            },
          },
        )
      )
    })
    Promise.all(createCommandPromises)
      .then(() => resolve(true))
      .catch((registerCommandError) => {
        console.error('Error registering commands', registerCommandError);
        resolve(false);
      });
  })
}

const handleCommand = (body) => {
  return new Promise((resolve, reject) => {
    const { name, options } = body.data;
    const command = name.toLowerCase();
    const args = {};
    if (options) {
      for (const option of options) {
        const { name, value } = option;
        args[name] = value;
      }
    }
    switch (command) {
      case 'echo':
        resolve({
          type: 4,
          data: {
            content: args.message,
          },
        });
        break;
      case 'broadcast':
        resolve({
          type: 4,
          data: {
            content: 'Broadcasting message...',
          },
        });
        break;
      case 'text_channel':
        resolve({
          type: 4,
          data: {
            content: 'Creating text channel...',
          },
        });
        break;
      case 'kick':
        resolve({
          type: 4,
          data: {
            content: 'Kicking user...',
          },
        });
        break;
      case 'ban':
        resolve({
          type: 4,
          data: {
            content: 'Banning user...',
          },
        });
        break;
      default:
        reject(new Error('Unknown command'));
    }
  })
}

module.exports = {
  registerCommand,
  handleCommand
}