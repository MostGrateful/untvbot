const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const {
  getLists,
  getLabels,
  createCard,
  archiveCardByName,
  getAllCards
} = require('../../utils/TrelloAPI');
const sendLogEmbed = require('../../utils/sendLogEmbed');

const BOARD_ID = 'klNFx3G4';

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
        .setDescription('Superadmin, Admin, or Staff')
        .setRequired(true)
        .addChoices(
          { name: 'Superadmin', value: 'superadmin' },
          { name: 'Admin', value: 'admin' },
          { name: 'Staff', value: 'staff' }
        )
    )
    .addStringOption(option =>
      option.setName('role')
        .setDescription('Enter their staff role (free text)')
        .setRequired(true)
    ),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: 64 });

    const db = client.db;
    const action = interaction.options.getString('action');
    const targetUser = interaction.options.getUser('user');
    const category = interaction.options.getString('category').toLowerCase();
    const roleText = interaction.options.getString('role');
    const commandUser = interaction.user;
    const guildId = interaction.guild.id;

    if (category === 'bot management') {
      return interaction.editReply('❌ You cannot add or remove members from **Bot Management** using this command.');
    }

    const lists = await getLists();
    const cards = await getAllCards(BOARD_ID);

    const userCard = cards.find(card =>
      card.name.toLowerCase() === commandUser.username.toLowerCase()
    );

    const userListId = userCard?.idList;
    const userListName = Object.entries(lists).find(([, id]) => id === userListId)?.[0];

    const isBotMgmt = userListName === 'bot management';
    const isSuperadmin = userListName === 'superadmin';
    const isAdmin = userListName === 'admin';

    if (category === 'superadmin' && !isBotMgmt) {
      return interaction.editReply('❌ Only **Bot Management** can add or remove Superadmins.');
    }

    if (category === 'admin' && !(isBotMgmt || isSuperadmin)) {
      return interaction.editReply('❌ Only **Bot Management** or **Superadmins** can add or remove Admins.');
    }

    if (category === 'staff' && !(isBotMgmt || isSuperadmin || isAdmin)) {
      return interaction.editReply('❌ Only **Bot Management**, **Superadmins**, or **Admins** can add or remove Staff.');
    }

    const exists = cards.some(card => card.name.toLowerCase() === targetUser.username.toLowerCase());

    if (action === 'remove') {
      if (!exists) {
        return interaction.editReply(`⚠️ No Trello card found for **${targetUser.username}**. Cannot remove.`);
      }

      await archiveCardByName(targetUser.username);
      await interaction.editReply(`📁 Archived **${targetUser.username}** from Trello.`);

      const embed = new EmbedBuilder()
        .setTitle('📋 Removed Staff Member')
        .addFields(
          { name: 'User', value: targetUser.tag, inline: true },
          { name: 'By', value: commandUser.tag, inline: true },
          { name: 'Category', value: category, inline: true }
        )
        .setColor(0xed4245)
        .setTimestamp();

      return sendLogEmbed(client, guildId, embed);
    }

    if (exists) {
      return interaction.editReply(`⚠️ A Trello card for **${targetUser.username}** already exists. Aborting.`);
    }

    const listId = lists[category];
    const labels = await getLabels();
    const labelId = labels[roleText.toLowerCase()] || null;

    const desc = [
      `**Roblox Username:** ${targetUser.username}`,
      `**Discord ID:** ${targetUser.id}`,
      `**Deaprtment: UNTV:** UNTV`,
      `**Role:** ${roleText}`,
    ].join('\n');

    try {
      await createCard(listId, targetUser.username, desc, labelId);
      await interaction.editReply(`✅ Added **${targetUser.username}** under **${category}**.`);

      const embed = new EmbedBuilder()
        .setTitle('📋 Added Staff Member')
        .addFields(
          { name: 'User', value: targetUser.tag, inline: true },
          { name: 'By', value: commandUser.tag, inline: true },
          { name: 'Category', value: category, inline: true },
          { name: 'Role', value: roleText, inline: true }
        )
        .setColor(0x57f287)
        .setTimestamp();

      return sendLogEmbed(client, guildId, embed);
    } catch (error) {
      console.error(error);
      return interaction.editReply('❌ Failed to create Trello card.');
    }
  }
};
