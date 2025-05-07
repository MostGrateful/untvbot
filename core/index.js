const { Client, Collection, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const loadCommands = require('../utils/loadCommands');
const loadEvents = require('../utils/loadEvents');
const db = require('./db');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Make DB + commands available to all commands
client.db = db;
client.commands = new Collection();

(async () => {
  // Load commands
  const commands = await loadCommands({ client });
  console.log(`✅ Loaded ${client.commands.size} commands.`);

  // Load events
  await loadEvents(client);

  // Login
  client.login(process.env.DISCORD_TOKEN).then(() =>
    console.log(`🤖 Logged in as ${client.user?.tag}`)
  );
})();
