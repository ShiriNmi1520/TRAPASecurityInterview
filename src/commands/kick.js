const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a user from server!')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to kick out')
        .setRequired(true))
};