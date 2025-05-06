require('dotenv').config();
const { REST, Routes } = require('discord.js');
const loadCommands = require('./loadCommands');

const rest = new REST().setToken(process.env.BOT_TOKEN);

(async () => {
  const commands = await loadCommands(); // no client needed

  try {
    console.log('🔁 Refreshing application (/) commands...');

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands },
    );

    console.log(`✅ Successfully reloaded ${commands.length} application (/) commands.`);
  } catch (error) {
    console.error(error);
  }
})();

