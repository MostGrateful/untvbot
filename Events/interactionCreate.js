module.exports = {
    name: 'interactionCreate',
  
    async execute(interaction, client) {
      if (!interaction.isChatInputCommand()) return;
  
      // 🔒 Blacklist check
      const [rows] = await client.db.query('SELECT * FROM blacklist WHERE user_id = ?', [interaction.user.id]);
      if (rows.length > 0) {
        return interaction.reply({
          content: '❌ You are blacklisted from using this bot.',
          flags: 64
        });
      }
  
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
  
      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error(`❌ Error in /${interaction.commandName}:`, error);
        await interaction.reply({
          content: '❌ An error occurred while executing this command.',
          flags: 64
        });
      }
    }
  };
  