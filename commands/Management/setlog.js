const { SlashCommandBuilder, ChannelType, EmbedBuilder } = require('discord.js');
const { getAllCards, getLists } = require('../../utils/TrelloAPI');

const BOARD_ID = 'klNFx3G4';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setlog')
    .setDescription('Set the log channel for this server (Bot Management or Superadmin only).')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('The log channel to use')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText)
    ),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: 64 });

    const db = client.db;
    const logChannel = interaction.options.getChannel('channel');
    const guildId = interaction.guild.id;
    const username = interaction.user.username;

    try {
      const lists = await getLists();
      const cards = await getAllCards(BOARD_ID);

      const userCard = cards.find(card => card.name.toLowerCase() === username.toLowerCase());
      const userListId = userCard?.idList;
      const userListName = Object.entries(lists).find(([, id]) => id === userListId)?.[0];

      const isBotMgmt = userListName === 'bot management';
      const isSuperadmin = userListName === 'superadmin';

      if (!isBotMgmt && !isSuperadmin) {
        return interaction.editReply('❌ Only **Bot Management** or **Superadmin** can set the log channel.');
      }

      await db.query(
        'INSERT INTO guild_logs (guild_id, log_channel_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE log_channel_id = VALUES(log_channel_id)',
        [guildId, logChannel.id]
      );

      await interaction.editReply(`✅ Log channel has been set to <#${logChannel.id}>.`);

      // 📢 Send a log message to the newly set channel
      const embed = new EmbedBuilder()
        .setTitle('🔧 Log Channel Set')
        .setDescription(`The log channel for this server was set to <#${logChannel.id}>.`)
        .addFields(
          { name: 'By', value: `${interaction.user.tag}`, inline: true },
          { name: 'User ID', value: `${interaction.user.id}`, inline: true }
        )
        .setColor(0x00AE86)
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });

    } catch (err) {
      console.error(err);
      return interaction.editReply('❌ Failed to set log channel due to an internal error.');
    }
  }
};
