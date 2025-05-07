const fs = require('fs');
const path = require('path');

module.exports = async function loadCommands({ client }) {
  const commands = [];

  const walk = (dir) => {
    const files = fs.readdirSync(dir, { withFileTypes: true });

    for (const file of files) {
      const filePath = path.join(dir, file.name);

      if (file.isDirectory()) {
        walk(filePath);
      } else if (file.name.endsWith('.js')) {
        const command = require(filePath);
        if (command?.data && typeof command.execute === 'function') {
          commands.push(command.data.toJSON());
          if (client?.commands) {
            client.commands.set(command.data.name, command);
            console.log(`[✔️] Loaded command: ${command.data.name}`);
          }
        }
      }
    }
  };

  const commandsPath = path.join(__dirname, '..', 'commands');
  walk(commandsPath);

  return commands;
};

