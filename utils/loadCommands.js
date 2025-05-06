const fs = require('fs');
const path = require('path');

module.exports = async (client = null) => {
  const commandsArray = [];
  const commandsPath = path.join(__dirname, '../commands');
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ('data' in command && 'execute' in command) {
      if (client) client.commands.set(command.data.name, command);
      commandsArray.push(command.data.toJSON());
    } else {
      console.warn(`[WARNING] Command at ${file} is missing "data" or "execute".`);
    }
  }

  return commandsArray;
};
