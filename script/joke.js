const axios = require("axios");

module.exports["config"] = {
  name: "joke",
  aliases: ["funny", "humor", "jokes"],
  info: "get a random joke",
  isPrefix: false,
  version: "1.0.0",
  cd: 8,
};

module.exports["run"] = async ({ chat, font, event }) => {
  try {
    const response = await axios.get("https://official-joke-api.appspot.com/random_joke");
    const joke = `${response.data.setup} - ${response.data.punchline}`;
    chat.reply(font.monospace(joke), event.threadID, event.messageID);
  } catch (error) {
    chat.reply(font.monospace(error.message), event.threadID, event.messageID);
  }
};
