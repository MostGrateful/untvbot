const { Client, GatewayIntentBits, Events } = require('discord.js');
const loadCommands = require('../utils/loadCommands');
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.commands = new Map(); // ✅ <-- This prevents the undefined error

(async () => {
  const commands = await loadCommands(client); // Loads and registers slash commands

  client.once(Events.ClientReady, () => {
    console.log(`🤖 UNTV is online as ${client.user.tag}`);
  });

  client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction, client);
    } catch (error) {
      console.error(`❌ Error executing command '${interaction.commandName}':`, error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: '❌ There was an error while executing this command.', ephemeral: true });
      } else {
        await interaction.reply({ content: '❌ There was an error while executing this command.', ephemeral: true });
      }
    }
  });

  client.login(process.env.BOT_TOKEN);
})();

