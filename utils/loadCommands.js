const fs = require('fs');
const path = require('path');

module.exports = async function loadCommands(client) {
  const commandsArray = [];

  const commandsPath = path.join(__dirname, '../commands');
  const commandFolders = fs.readdirSync(commandsPath);

  for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const command = require(filePath);

      if (command.data && command.execute) {
        commandsArray.push(command.data.toJSON());

        // ✅ Add this line right here:
        console.log(`[✔️] Loaded command: ${command.data.name}`);

        if (client) {
          client.commands.set(command.data.name, command);
        }
      } else {
        console.warn(`[⚠️] Skipped invalid command: ${filePath}`);
      }
    }
  }

  return commandsArray;
};
