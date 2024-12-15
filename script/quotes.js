const axios = require("axios");

module.exports["config"] = {
  name: "quote",
  aliases: ["inspire", "motivation", "quotes"],
  info: "get a random motivational quote",
  isPrefix: false,
  version: "1.0.0",
  cd: 8,
};

module.exports["run"] = async ({ chat, font, event }) => {
  try {
    const response = await axios.get("https://raw.githubusercontent.com/JamesFT/Database-Quotes-JSON/master/quotes.json");
    const quotes = response.data;

    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];

    const quote = `"${randomQuote.quoteText}"\n\n— ${randomQuote.quoteAuthor}`;
    chat.reply(font.monospace(quote), event.threadID, event.messageID);
  } catch (error) {
    chat.reply(font.monospace(error.message), event.threadID, event.messageID);
  }
};
