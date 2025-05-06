const { SlashCommandBuilder } = require('discord.js');
const { getLists, getLabels, createCard, deleteCardByName } = require('../../utils/TrelloAPI');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('staffmanagment')
    .setDescription('Add or remove a staff member on the Trello board.')
    .addStringOption(option =>
      option.setName('action')
        .setDescription('Add or remove a staff member')
        .setRequired(true)
        .addChoices(
          { name: 'Add', value: 'add' },
          { name: 'Remove', value: 'remove' }
        )
    )
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Select the Discord user')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('category')
        .setDescription('Admin or Staff')
        .setRequired(true)
        .addChoices(
          { name: 'Admin', value: 'admin' },
          { name: 'Staff', value: 'staff' }
        )
    )
    .addStringOption(option =>
      option.setName('role')
        .setDescription('Select their role')
        .setRequired(true)
        .addChoices(
          { name: 'Director of UNTV', value: 'Director of UNTV' },
          { name: 'Deputy Director of UNTV', value: 'Deputy Director of UNTV' },
          { name: 'Chief of Staff', value: 'Chief of Staff' },
          { name: 'Producer', value: 'Producer' },
          { name: 'Production Crew', value: 'Production Crew' },
          { name: 'Editor-In-Chief', value: 'Editor-In-Chief' },
          { name: 'Editiors', value: 'Editiors' },
          { name: 'Writer/Reporter', value: 'Writer/Reporter' },
          { name: 'Graphics Team', value: 'Graphics Team' },
        )
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const action = interaction.options.getString('action');
    const user = interaction.options.getUser('user');
    const category = interaction.options.getString('category').toLowerCase();
    const role = interaction.options.getString('role');

    if (action === 'remove') {
      const removed = await deleteCardByName(user.username);
      if (removed) {
        return interaction.editReply(`🗑️ Successfully removed **${user.username}** from Trello.`);
      } else {
        return interaction.editReply(`⚠️ No Trello card found for **${user.username}**.`);
      }
    }

    // Add action
    const lists = await getLists();
    const labels = await getLabels();

    const listId = lists[category];
    const labelId = labels[role.toLowerCase()] || null;

    const description = [
      `**Roblox Username:** ${user.username}`,
      `**Discord ID:** ${user.id}`,
      `**Deaprtment: UNTV:** UNTV`,
      `**Role:** ${role}`,
    ].join('\n');

    try {
      await createCard(listId, user.username, description, labelId);
      await interaction.editReply(`✅ Added **${user.username}** to the Trello board under **${category.charAt(0).toUpperCase() + category.slice(1)}** with role **${role}**.`);
    } catch (err) {
      console.error(err);
      await interaction.editReply('❌ Failed to create Trello card. Check API credentials and board setup.');
    }
  },
};
