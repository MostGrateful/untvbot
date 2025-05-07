// commands/Owner/blacklist.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('blacklist')
    .setDescription('Blacklist or unblacklist a user globally.')
    .addSubcommand(sub =>
      sub.setName('add')
        .setDescription('Add a user to the global blacklist')
        .addUserOption(opt =>
          opt.setName('user').setDescription('User to blacklist').setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('reason').setDescription('Reason for blacklist').setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('remove')
        .setDescription('Remove a user from the global blacklist')
        .addUserOption(opt =>
          opt.setName('user').setDescription('User to unblacklist').setRequired(true)
        )
    ),

  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();
    const user = interaction.options.getUser('user');
    const userId = user.id;

    if (interaction.user.id !== process.env.OWNER_ID) {
      return interaction.reply({ content: '❌ Only the bot owner can use this command.', flags: 64 });
    }

    const db = client.db;

    if (sub === 'add') {
      const reason = interaction.options.getString('reason');
      await db.query('REPLACE INTO blacklist (user_id, reason, added_by) VALUES (?, ?, ?)', [
        userId,
        reason,
        interaction.user.id
      ]);
      return interaction.reply({ content: `✅ Blacklisted ${user.tag}`, flags: 64 });
    }

    if (sub === 'remove') {
      await db.query('DELETE FROM blacklist WHERE user_id = ?', [userId]);
      return interaction.reply({ content: `✅ Removed ${user.tag} from blacklist.`, flags: 64 });
    }
  }
};
