const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('broadcast')
    .setDescription('Create a cron schedule to broadcast message to specific channel!')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to broadcast message to')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Message to broadcast')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('schedule')
        .setDescription('Cron schedule')
        .setRequired(true)
    )
};