const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('text_channel')
    .setDescription('Create a new channel!')
    .addStringOption(option =>
      option.setName('input')
        .setDescription('The name of the channel')
        .setRequired(true))
};