const { REST, Routes } = require('discord.js');
require('dotenv').config();

const { Client, Collection, GatewayIntentBits } = require('discord.js');
const loadCommands = require('./loadCommands');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});
client.commands = new Collection();

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  await loadCommands({ client });

  const commandData = client.commands.map(cmd => cmd.data.toJSON());

  try {
    console.log('🔁 Refreshing application (/) commands...');

    // GLOBAL DEPLOY
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commandData }
    );

    console.log(`✅ Successfully deployed ${commandData.length} global commands.`);
  } catch (error) {
    console.error('❌ Failed to deploy commands:', error);
  } finally {
    process.exit(0);
  }
})();


