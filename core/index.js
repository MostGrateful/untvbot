const { Client, GatewayIntentBits, Events } = require('discord.js');
const loadCommands = require('../utils/loadCommands');
const db = require('./db');
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.commands = new Map();
client.db = db;

(async () => {
  try {
    const [rows] = await db.query('SELECT 1');
    console.log('🗄️ MySQL connected successfully.');
  } catch (err) {
    console.error('❌ MySQL connection failed:', err);
    process.exit(1);
  }

  await loadCommands(client);

  client.once(Events.ClientReady, () => {
    console.log(`🤖 UNTV Bot is online as ${client.user.tag}`);
  });

  client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction, client);
    } catch (error) {
      console.error(`❌ Error in /${interaction.commandName}:`, error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: '❌ There was an error while executing this command.', ephemeral: true });
      } else {
        await interaction.reply({ content: '❌ There was an error while executing this command.', ephemeral: true });
      }
    }
  });

  client.login(process.env.DISCORD_TOKEN);
})();
