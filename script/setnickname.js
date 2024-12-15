module.exports = {
  config: {
    name: "setnickname",
    aliases: ["setname", "chnickname", "chname", "setnn"],
    info: "Change bot nickname in the current group",
    type: "settings",
    usage: "[name]",
    role: 1,
    credits: "atomic slash studio"
  },
  run: async ({ chat, args, font }) => {
    try {
      const name = args.join(" ");

      if (!name) {
        chat.reply(font.monospace("Please provide a nickname."));
        return;
      }

      if (name.length > 32) {
        chat.reply(font.monospace("Nickname is too long. Maximum length is 32 characters."));
        return;
      }

      const validNickname = /^[a-zA-Z0-9 ]*$/.test(name);
      if (!validNickname) {
        chat.reply(font.monospace("Nickname contains invalid characters. Only alphanumeric characters and spaces are allowed."));
        return;
      }

      await chat.nickname(name, chat.botID());
      chat.reply(font.monospace(`Nickname successfully changed to: ${name}`));
    } catch (err) {
      chat.reply(font.monospace(`Error: ${err.message}`));
    }
  }
};