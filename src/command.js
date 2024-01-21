const fs= require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, REST, Routes, ChannelType } = require('discord.js');
const config = require('./config')
const { Scheduler } = require('aws-sdk');

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
      const serverID = body.channel.guild_id
      return executeCommand(command, options, user, serverID)
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

const executeCommand = async (command, options, user, serverID) => {
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
    case 'broadcast':
      try {
        console.debug('Executing broadcast command')
        const payload = {
          server: serverID,
          message: options[1].value,
          channel: options[0].value,
        }
        // Create Scheduler
        const scheduler = new Scheduler()
        // Create job
        await scheduler.createSchedule({
          FlexibleTimeWindow: {
            Mode: 'OFF'
          },
          Name: `broadcast-${Date.now()}`,
          ScheduleExpression: `cron(${options[2].value})`,
          State: 'ENABLED',
          Description: `Broadcast created by ${user.username} at ${new Date().toISOString()}`,
          Target: {
              Arn: "arn:aws:lambda:ap-southeast-1:347819602869:function:DiscordSlashBot-dev-cron",
              RoleArn: "arn:aws:iam::347819602869:role/cronScheduler",
              Input: JSON.stringify(payload),
          },
        }).promise()
        return {
          type: 4,
          data: {
            content: `Broadcast scheduled`
          }
        }
      } catch (broadcastError) {
        console.error('Error broadcasting message', broadcastError)
        return {
          type: 4,
          data: {
            content: `Error broadcasting message`
          }
        }
      }
    case 'unban':
      try {
        console.debug('Executing unban command')
        const userId = options[0].value
        const client = new Client({
          intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
        })
        await client.login(config.discord.token)
        const guild = client.guilds.cache.get(config.discord.guildId)
        const member = await guild.members.fetch(userId)
        // Unmute user
        if (member.voice.channel && member.voice.serverMute) {
          await member.voice.setMute(false)
          return {
            type: 4,
            data: {
              content: `User ${member.user.username} unmuted`
            }
          }
        } else {
          return {
            type: 4,
            data: {
              content: `User ${member.user.username} not in voice channel or not muted`
            }
          }
        }
      } catch (unbanError) {
        console.error('Error unmuting user', unbanError)
        return {
          type: 4,
          data: {
            content: `Error unmuting user`
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