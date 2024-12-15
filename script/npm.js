const { exec } = require('child_process');

module.exports["config"] = {
  name: "npm",
  aliases: ["npm-package", "npm-info"],
  usage: "[search/install/uninstal/version/info] [package name]",
  info: "Interact with npm packages: search, install, uninstall, check version, etc.",
  guide: "Use npm <command> [package] to interact with npm packages.",
  type: "Programming",
  credits: "Kenneth",
  version: "1.0.0",
  role: 3,
};

module.exports["run"] = async ({ api, event, args, chat, font, admin, prefix, blacklist, Utils, Currencies, Experience, global }) => {
  const command = args[0];
  const packageToOperate = args[1];

  switch (command) {
    case "search":
      if (!packageToOperate) {
        return chat.reply(font.monospace('Please provide a search term.'));
      }
      try {
        exec(`npm search ${packageToOperate}`, (error, stdout, stderr) => {
          if (error) {
            chat.reply(font.monospace(`Error searching npm packages: ${error.message}`));
            return;
          }
          chat.reply(font.monospace(stdout));
        });
      } catch (error) {
        chat.reply(font.monospace(`Error searching npm packages: ${error.message}`));
      }
      break;

    case "install":
      if (!packageToOperate) {
        return chat.reply(font.monospace('Please provide the name of the package to install.'));
      }
      try {
        exec(`npm install ${packageToOperate}`, (error, stdout, stderr) => {
          if (error) {
            chat.reply(font.monospace(`Error installing ${packageToOperate}: ${error.message}`));
            return;
          }
          chat.reply(font.monospace(`Successfully installed ${packageToOperate}`));
        });
      } catch (error) {
        chat.reply(font.monospace(`Error installing ${packageToOperate}: ${error.message}`));
      }
      break;

    case "uninstall":
      if (!packageToOperate) {
        return chat.reply(font.monospace('Please provide the name of the package to uninstall.'));
      }
      try {
        exec(`npm uninstall ${packageToOperate}`, (error, stdout, stderr) => {
          if (error) {
            chat.reply(font.monospace(`Error uninstalling ${packageToOperate}: ${error.message}`));
            return;
          }
          chat.reply(font.monospace(`Successfully uninstalled ${packageToOperate}`));
        });
      } catch (error) {
        chat.reply(font.monospace(`Error uninstalling ${packageToOperate}: ${error.message}`));
      }
      break;

    case "version":
      if (!packageToOperate) {
        return chat.reply(font.monospace('Please provide the name of the package to check its version.'));
      }
      try {
        exec(`npm show ${packageToOperate} version`, (error, stdout, stderr) => {
          if (error) {
            chat.reply(font.monospace(`Error checking version for ${packageToOperate}: ${error.message}`));
            return;
          }
          chat.reply(font.monospace(`${packageToOperate} version: ${stdout}`));
        });
      } catch (error) {
        chat.reply(font.monospace(`Error checking version for ${packageToOperate}: ${error.message}`));
      }
      break;

    case "info":
      if (!packageToOperate) {
        return chat.reply(font.monospace('Please provide the name of the package to get information.'));
      }
      try {
        exec(`npm show ${packageToOperate} --json`, (error, stdout, stderr) => {
          if (error) {
            chat.reply(font.monospace(`Error retrieving information for ${packageToOperate}: ${error.message}`));
            return;
          }
          try {
            const info = JSON.parse(stdout);
            const response = `Name: ${info.name}\nDescription: ${info.description || "Nothing"}\nLatest Version: ${info.version}\nHomepage: ${JSON.stringify(info.homepage) || "No Specific" }\nRepository: ${JSON.stringify(info.repository) || "No Specific"}`;
            chat.reply(font.monospace(response));
          } catch (parseError) {
            chat.reply(font.monospace(`Error parsing npm info response: ${parseError.message}`));
          }
        });
      } catch (error) {
        chat.reply(font.monospace(`Error retrieving information for ${packageToOperate}: ${error.message}`));
      }
      break;

    default:
      chat.reply(font.monospace('Invalid npm command. Available commands: search, install, uninstall, version, info'));
  }
};
