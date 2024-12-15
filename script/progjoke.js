const axios = require("axios");

module.exports["config"] = {
  name: "progjoke",
  aliases: ["programmerjoke", "devjoke", "codingjoke"],
  info: "get a random programmer joke",
  isPrefix: false,
  version: "1.0.0",
  cd: 8,
};

module.exports["run"] = async ({ chat, font, event }) => {
  try {
    const response = await axios.get("https://official-joke-api.appspot.com/jokes/programming/random");
    const joke = `${response.data[0].setup} - ${response.data[0].punchline}`;
    chat.reply(font.monospace(joke), event.threadID, event.messageID);
  } catch (error) {
    chat.reply(font.monospace(error.message), event.threadID, event.messageID);
  }
};
