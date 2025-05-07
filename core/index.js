const { Client, Collection, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const db = require('./db');
const loadCommands = require('../utils/loadCommands');
const loadEvents = require('../utils/loadEvents');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Attach the database and command collection
client.db = db;
client.commands = new Collection();

(async () => {
  // Load commands with client reference
  await loadCommands({ client });

  // Load events
  await loadEvents(client);

  // Log in the bot
  await client.login(process.env.DISCORD_TOKEN);
  console.log(`🤖 Logged in as ${client.user.tag}`);
})();
