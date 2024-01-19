const fs= require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, REST, Routes, ChannelType } = require('discord.js');
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

const executeCommand = async (command, options, user) => {
  switch (command) {
    case 'echo':
      console.debug('Executing echo command')
      const input = options[0].value
      return {
        type: 4,
        data: {
          content: input
        }
      }
    case 'text_channel':
      try {
        console.debug('Executing text_channel command')
        const name = options[0].value
        const client = new Client({
          intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
        })
        await client.login(config.discord.token)
        const guild = client.guilds.cache.get(config.discord.guildId)
        await guild.channels.create({
          name: name,
          type: ChannelType.GuildText,
        })
        return {
          type: 4,
          data: {
            content: `Channel ${name} created`
          }
        }
      } catch (createChannelError) {
        console.error('Error creating channel', createChannelError)
        return {
          type: 4,
          data: {
            content: `Error creating channel`
          }
        }
      }
    case 'kick':
      try {
        console.debug('Executing kick command')
        const userId = options[0].value
        const client = new Client({
          intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
        })
        await client.login(config.discord.token)
        const guild = client.guilds.cache.get(config.discord.guildId)
        const member = await guild.members.fetch(userId)
        await member.kick()
        return {
          type: 4,
          data: {
            content: `User ${member.user.username} kicked`
          }
        }
      } catch (kickUserError) {
        console.error('Error kicking user', kickUserError)
        return {
          type: 4,
          data: {
            content: `Error kicking user`
          }
        }
      }
    case 'ban':
      try {
        console.debug('Executing ban command')
        const userId = options[0].value
        const client = new Client({
          intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
        })
        await client.login(config.discord.token)
        const guild = client.guilds.cache.get(config.discord.guildId)
        const member = await guild.members.fetch(userId)
        // Mute user
        if (member.voice.channel) {
          await member.voice.setMute(true)
          return {
            type: 4,
            data: {
              content: `User ${member.user.username} muted`
            }
          }
        } else {
          return {
            type: 4,
            data: {
              content: `User ${member.user.username} not in voice channel`
            }
          }
        }
      } catch (banUserError) {
        console.error('Error muting user', banUserError)
        return {
          type: 4,
          data: {
            content: `Error muting user`
          }
        }
      }
    default:
      console.error('Invalid command', command)
      return {
        type: 4,
        data: {
          content: `Invalid command ${command}`
        }
      }
  }
}

module.exports = {
  registerCommand,
  handleCommand
}