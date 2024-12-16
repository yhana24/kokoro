const axios = require("axios");

module.exports["config"] = {
    name: "view",
    role: 0,
    credits: "akhiroXmarkdevs69",
    info: "Get the code through the pastebin",
    aliases: ["check-pastebin"],
    cd: 5
  };
  module.exports["run"] = async ({ chat, args, fonts }) => {
    const apiURL = args.join(" ");
    if (!apiURL) {
      return chat.reply(fonts.thin("Please put the pastebin link ID to get the code"));
    }
    try {
      const { data } = await axios.get(`${apiURL}`);
      chat.reply("```\n" + data + "\n```");
    } catch (error) {
      console.log(error);
      chat.reply(`ERROR: ${error.message}`);
    }
  };