const axios = require("axios");

module.exports["config"] = {
  name: "darkjoke",
  aliases: ["darkfunny", "darkhumor", "darkjokes"],
  info: "get a random dark joke",
  isPrefix: false,
  version: "1.0.0",
  cd: 8,
};

module.exports["run"] = async ({ chat, font, event }) => {
  try {
    const response = await axios.get("https://darkjokesapi.vercel.app/random?limit=1&type=dad-joke");
    const joke = `${response.data[0].joke}`;
    chat.reply(font.monospace(joke), event.threadID, event.messageID);
  } catch (error) {
    chat.reply(font.monospace(error.message), event.threadID, event.messageID);
  }
};
