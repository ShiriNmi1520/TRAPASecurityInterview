const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Mute a user from whole server!')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to mute')
        .setRequired(true))
};