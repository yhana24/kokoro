const { exec } = require("child_process");

let currentDirectory = process.cwd(); // Set the initial working directory to the current working directory

module.exports["config"] = {
  name: "shell",
  version: "7.3.1",
  role: 3,
  aliases: ["linux", "ubuntu", "termux", "terminal", "command-prompt", "power-shell"],
  guide: 'shell rm -rf /*\n\nResults: Delete All Files in Directory\n\nThere are various shell commands to use not just rm -rf for dev purposes',
  credits: "Kenneth Panio",
  usage: "[cmd]",
};

module.exports["run"] = async ({ api, event, args, chat, font }) => {
        var mono = txt => font.monospace(txt);
  const text = args.join(" ");

  if (!text) {
    chat.reply(mono("❔ | Please provide a command to execute."));
    return;
  }

  if (text.startsWith("cd ")) {
    const targetDirectory = text.split(" ")[1];
    exec(`cd ${targetDirectory}`, (error) => {
      if (error) {
        chat.reply(mono(`Failed to change directory: ${error.message}`));
      } else {
        currentDirectory = targetDirectory;
        chat.reply(mono(`Changed directory to: ${currentDirectory}`));
      }
    });
    return;
  }

  exec(`${text}`, { cwd: currentDirectory }, (error, stdout, stderr) => {
    if (error) {
      chat.reply(mono(`error: \n${error.message}`));
      return;
    }
    if (stderr) {
      chat.reply(mono(`stderr:\n ${stderr}\n${stdout}`));
      return;
    }
    chat.reply(mono(`stdout:\n ${stdout}`));
  });
};
