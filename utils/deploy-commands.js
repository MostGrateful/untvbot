require('dotenv').config();
const { REST, Routes } = require('discord.js');
const loadCommands = require('./loadCommands');

const rest = new REST().setToken(process.env.DISCORD_TOKEN);
const guildIds = process.env.GUILD_IDS.split(',').map(id => id.trim());

(async () => {
  const commands = await loadCommands();

  for (const guildId of guildIds) {
    try {
      console.log(`🔁 Deploying to guild ${guildId}...`);

      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId),
        { body: commands }
      );

      console.log(`✅ Successfully deployed ${commands.length} commands to guild ${guildId}`);
    } catch (error) {
      console.error(`❌ Failed to deploy commands to guild ${guildId}:`, error);
    }
  }
})();

