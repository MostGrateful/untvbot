const { SlashCommandBuilder } = require('discord.js');
const { getLists, createCard, archiveCardByName } = require('../../utils/TrelloAPI');

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
    const db = client.db;

    // Only the bot owner can use this
    if (interaction.user.id !== process.env.OWNER_ID) {
      return interaction.reply({
        content: '❌ Only the bot owner can use this command.',
        flags: 64
      });
    }

    if (sub === 'add') {
      const reason = interaction.options.getString('reason');

      // Add to SQL blacklist
      await db.query(
        'REPLACE INTO blacklist (user_id, reason, added_by) VALUES (?, ?, ?)',
        [userId, reason, interaction.user.id]
      );

      // Add to Trello
      const lists = await getLists();
      const listId = lists['blacklisted'];

      if (listId) {
        const desc = [
          `**Discord Username:** ${user.tag}`,
          `**Discord ID:** ${user.id}`,
          `**Department:** UNTV`,
          `**Role:** Blacklisted`
        ].join('\n');

        await createCard(listId, user.username, desc);
      }

      return interaction.reply({
        content: `✅ Blacklisted ${user.tag} and added to Trello.`,
        flags: 64
      });
    }

    if (sub === 'remove') {
      // Remove from SQL blacklist
      await db.query('DELETE FROM blacklist WHERE user_id = ?', [userId]);

      // Archive from Trello
      const archived = await archiveCardByName(user.username);

      return interaction.reply({
        content: archived
          ? `✅ Removed ${user.tag} from blacklist and archived their Trello card.`
          : `✅ Removed ${user.tag} from blacklist (no Trello card found to archive).`,
        flags: 64
      });
    }
  }
};
