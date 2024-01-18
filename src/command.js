const fs= require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, REST, Routes } = require('discord.js');
const config = require('./config')

const registerCommand = () => {
  return new Promise((resolve, _reject) => {
    try {
      // Load commands from commands folder
      const commands = [];
      const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));
      commandFiles.map(commandFile => {
        const command = require(`./commands/${commandFile}`);
        commands.push(command.data.toJSON())
      })
      // Register command
      const rest = new REST().setToken(config.discord.token);
      rest.put(Routes.applicationGuildCommands(config.discord.applicationID, config.discord.guildId), { body: commands })
        .then(() => resolve(true))
        .catch(restPutError => {
          console.error('Register command error (PUT command)', restPutError)
          resolve(false)
        })
    } catch (registerError) {
      console.error('Register command error', registerError)
      resolve(false)
    }
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