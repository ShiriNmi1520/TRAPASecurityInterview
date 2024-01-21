const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unmute a user from whole server!')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to unmute')
        .setRequired(true))
};