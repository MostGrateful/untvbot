require('dotenv').config();
const { REST, Routes } = require('discord.js');
const loadCommands = require('./loadCommands');

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  const commands = await loadCommands(); // Loads and prepares command data

  try {
    console.log('🔁 Refreshing global application (/) commands...');

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID), // Global command registration
      { body: commands }
    );

    console.log(`✅ Successfully reloaded ${commands.length} global slash command(s).`);
  } catch (error) {
    console.error('❌ Failed to deploy global slash commands:', error);
  }
})();

