module.exports["config"] = {
  name: "install",
  aliases: ["installer", "loadcmd", "cmdload", "command", "cmd"],
  usage: "[filename.js] or [reply to message body containing code with filename.js]",
  info: "Install or uninstall a command from provided code or by replying to a message with the command code.",
  guide: "cmd [filename.js] or reply to message body with [filename.js] to install the command. Use 'cmd uninstall [filename.js]' keyword to remove a command. Use 'cmd list' to list all installed commands.",
  type: "installation",
  credits: "Kenneth Panio",
  version: "1.1.0",
  role: 3,
};

module.exports["run"] = async ({ chat, event, args, font }) => {
  var mono = txt => font.monospace(txt);
  
  const fs = require('fs').promises;
  const path = require('path');
  /*const { transpileModule } = require('typescript');*/

  const uninstallKeywords = ["uninstall", "delete", "remove", "rm", "del"];

  const listCommands = async () => {
    try {
      const files = await fs.readdir(__dirname);
      const commandFiles = files.filter(file => file.endsWith('.js') /*|| file.endsWith('.ts')*/);
      const commands = commandFiles.map((file, index) => `${index + 1}. ${file.replace(/\.[^/.]+$/, '')}`);
      return commands.length ? commands.join('\n') : 'No commands installed.';
    } catch (error) {
      throw new Error(`An error occurred while listing commands: ${error.message}`);
    }
  };

  if (args[0] === 'list') {
    try {
      const commandList = await listCommands();
      return chat.reply(mono(commandList));
    } catch (error) {
      return chat.reply(mono(`Error: ${error.message}`));
    }
  }

  if (uninstallKeywords.includes(args[0])) {
    if (args.length !== 2) {
      return chat.reply(mono('Please provide the filename of the command to uninstall.'));
    }
    const fileName = args[1];
    const filePath = path.join(__dirname, fileName);

    try {
      await fs.unlink(filePath);
      await chat.reply(mono(`Command ${fileName} successfully uninstalled.`));
      process.exit(1);
    } catch (error) {
      return chat.reply(mono(`An error occurred while uninstalling the command: ${error.message}`));
    }
  }

  if (event.type === "message_reply") {
    const snippet = args.slice(1).join(' ');
    const text = event.messageReply.body || snippet;

    if (!text.trim()) {
      return chat.reply(mono('No code provided for installation.'));
    }

    const fileName = args[0];
    const fileExtension = fileName.split('.').pop()?.toLowerCase();

    if (fileExtension !== 'js'/* && fileExtension !== 'ts'*/) {
      return chat.reply(mono('Invalid file extension. Please provide a .js file.'));
    }

    if (fileExtension === 'js') {
      try {
        eval(text); 
      } catch (error) {
        return chat.reply(mono(`Syntax error detected in the provided JavaScript code: ${error.message}`));
      }
    }

  /*  if (fileExtension === 'ts') {
      try {
        transpileModule(text, {}); 
      } catch (error) {
        return chat.reply(mono(`Syntax error detected in the provided TypeScript code: ${error.message}`));
      }
    }*/

    const filePath = path.join(__dirname, fileName);
    
    try {
      await fs.writeFile(filePath, text, "utf-8");
      await chat.reply(mono(`Command ${fileName} successfully installed.`));
      process.exit(1);
    } catch (error) {
      return chat.reply(mono(`An error occurred while installing the command: ${error.message}`));
    }
  } else {
    if (args.length < 2) {
      return chat.reply(mono('Please reply to a message containing the command code or provide the code directly in the format install [filename.js]. or use cmd uninstall [filename.js]'));
    } else {
      const snippet = args.slice(1).join(' ');
      if (!snippet.trim()) {
        return chat.reply(mono('No code provided for installation.'));
      }

      const fileName = args[0];
      const fileExtension = fileName.split('.').pop()?.toLowerCase();

      if (fileExtension !== 'js'/* && fileExtension !== 'ts'*/) {
        return chat.reply(mono('Invalid file extension. Please provide a .js file.'));
      }

      if (fileExtension === 'js') {
        try {
          eval(snippet); 
        } catch (error) {
          return chat.reply(mono(`Syntax error detected in the provided JavaScript code: ${error.message}`));
        }
      }

    /*  if (fileExtension === 'ts') {
        try {
          transpileModule(snippet, {});
        } catch (error) {
          return chat.reply(mono(`Syntax error detected in the provided TypeScript code: ${error.message}`));
        }
      }*/

      const filePath = path.join(__dirname, fileName);
      
      try {
        await fs.writeFile(filePath, snippet, "utf-8");
        await chat.reply(mono(`Command ${fileName} successfully installed.`));
        process.exit(1);
      } catch (error) {
        return chat.reply(mono(`An error occurred while installing the command: ${error.message}`));
      }
    }
  }
};
