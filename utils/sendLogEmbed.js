const { EmbedBuilder } = require('discord.js');

module.exports = async function sendLogEmbed(client, guildId, embed) {
  try {
    // Send to assigned guild's log channel
    const [rows] = await client.db.query(
      'SELECT log_channel_id FROM guild_logs WHERE guild_id = ?',
      [guildId]
    );

    const guildLogId = rows[0]?.log_channel_id;
    if (guildLogId) {
      const channel = await client.channels.fetch(guildLogId).catch(() => null);
      if (channel) await channel.send({ embeds: [embed] });
    }

    // Send to global dev log channel
    const devChannelId = process.env.DEV_GUILD_LOG_CHANNEL_ID;
    if (devChannelId) {
      const devChannel = await client.channels.fetch(devChannelId).catch(() => null);
      if (devChannel) await devChannel.send({ embeds: [embed] });
    }
  } catch (err) {
    console.error('Log dispatch failed:', err);
  }
};
