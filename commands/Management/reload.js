const { SlashCommandBuilder } = require('discord.js');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reload')
    .setDescription('Reloads a command without restarting the bot')
    .addStringOption(option =>
      option.setName('command')
        .setDescription('The name of the command to reload')
        .setRequired(true)
    ),

  async execute(interaction, client) {
    // 🔐 Restrict to OWNER_ID from .env
    if (interaction.user.id !== process.env.OWNER_ID) {
      return interaction.reply({
        content: '❌ You do not have permission to use this command.',
        flags: 64
      });
    }

    const commandName = interaction.options.getString('command').toLowerCase();
    const oldCommand = client.commands.get(commandName);

    if (!oldCommand) {
      return interaction.reply({
        content: `❌ Command \`${commandName}\` not found.`,
        flags: 64
      });
    }

    // 🔍 Locate the command file
    const baseDir = path.join(__dirname, '..');
    let commandPath;

    for (const folder of fs.readdirSync(baseDir)) {
      const file = path.join(baseDir, folder, `${commandName}.js`);
      if (fs.existsSync(file)) {
        commandPath = file;
        break;
      }
    }

    if (!commandPath) {
      return interaction.reply({
        content: `❌ Could not locate the file for \`${commandName}\`.`,
        flags: 64
      });
    }

    try {
      // ♻️ Clear and reload the command
      delete require.cache[require.resolve(commandPath)];
      const newCommand = require(commandPath);
      client.commands.set(newCommand.data.name, newCommand);

      return interaction.reply({
        content: `✅ Successfully reloaded \`${newCommand.data.name}\`.`,
        flags: 64
      });
    } catch (err) {
      console.error(err);
      return interaction.reply({
        content: `❌ Failed to reload command: \`${commandName}\`. Check console for details.`,
        flags: 64
      });
    }
  }
};

