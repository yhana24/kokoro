const axios = require('axios');

module.exports["config"] = {
  name: "urban-dictionary",
  aliases: ["urban-define", "urban-meaning", "urban-word", "urbanword", "urbandefine", "urbanterm", "urban-term", "urban"],
  version: "1.0.0",
  role: 0,
  credits: "Reiko Dev",
  info: "Retrieve definitions from Urban Dictionary",
  type: "info",
  usage: "[term]",
};

module.exports["run"] = async function ({ api, event, args, chat, font, global }) {
        var mono = txt => font.monospace(txt);
  const term = args[0];

  if (!term) {
    return chat.reply(mono("Please provide a term to search for."));
  }

  try {
    const response = await require("axios").get(`https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(term)}`);
    const definitions = response.data.list;

    if (definitions.length > 0) {
      let msg = `Urban Dictionary definitions for "${term}"\n${global.design.line}`;

      definitions.forEach((item, index) => {
        msg += `\n${index + 1}. ${item.definition}\nExample: ${item.example}\nAuthor: ${item.author}\nVotes: 👍 ${item.thumbs_up}  👎 ${item.thumbs_down}\n`;

        if (index < definitions.length - 1) {
          msg += global.design.line;
        }
      });
        chat.reply(mono(msg));
    } else {
      chat.reply(mono(`No definitions found for '${term}' on Urban Dictionary.`));
    }
  } catch (error) {
    chat.reply(mono("An error occurred while fetching the definition. Please try again later: " + error.message));
  }
};
