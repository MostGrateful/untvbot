const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const sendLogEmbed = require('../../utils/sendLogEmbed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong and shows bot latency.'),

  async execute(interaction, client) {
    const sent = await interaction.reply({
      content: 'Pong!',
      fetchReply: true
    });

    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    await interaction.editReply(`Pong! 🏓 Latency is \`${latency}ms\`.`);

    const embed = new EmbedBuilder()
      .setTitle('📶 /ping Used')
      .setDescription(`Ping used in <#${interaction.channel.id}>`)
      .addFields(
        { name: 'User', value: interaction.user.tag, inline: true },
        { name: 'Latency', value: `${latency}ms`, inline: true }
      )
      .setColor(0x5865f2)
      .setTimestamp();

    await sendLogEmbed(client, interaction.guild.id, embed);
  }
};

