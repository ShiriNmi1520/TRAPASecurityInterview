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

const handleCommand = async (body) => {
  switch (body.type) {
    case 2: // Slash command
      // Load command from commands folder
      const command = body.data.name
      const options = body.data.options
      const user = body.member.user
      return executeCommand(command, options, user)
    default:
      console.error('Invalid interaction type', body.type)
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Invalid interaction type' }),
        headers: {
          'Content-Type': 'application/json',
        }
      };
  }
}

const executeCommand = (command, options, user) => {
  return new Promise((resolve, reject) => {
    switch (command) {
      case 'echo':
        console.debug('Executing echo command')
        const input = options[0].value
        resolve({
            type: 4,
            data: {
              content: input
            }
        });
        break;
      default:
        console.error('Invalid command', command)
        reject(new Error('Invalid command'))
    }
  })
}

module.exports = {
  registerCommand,
  handleCommand
}