const axios = require("axios");

module.exports["config"] = {
  name: "bible",
  aliases: ["verse", "bibleverse", "scripture"],
  info: "Get a random Bible verse or a specific one",
  isPrefix: false,
  guide: "bible john 3:16",
  usage: "[verse]",
  version: "1.0.0",
  cd: 8,
};

module.exports["run"] = async ({ chat, font, event, args }) => {
  try {
    let url;
    const passage = args.join(" ");
    if (passage) {
      url = `https://labs.bible.org/api/?passage=${encodeURIComponent(passage)}&type=json`;
    } else {
      url = "https://labs.bible.org/api/?passage=random&type=json";
    }

    const response = await axios.get(url);
    const verse = response.data[0];
    const verseText = `${verse.bookname} ${verse.chapter}:${verse.verse}\n\n${verse.text}`;
    chat.reply(font.monospace(verseText), event.threadID, event.messageID);
  } catch (error) {
    if (error.response && error.response.status === 400) {
      return chat.reply(font.monospace("No verse found or invalid passage!"), event.threadID, event.messageID);
    }
    chat.reply(font.monospace("An error occurred: " + error.message), event.threadID, event.messageID);
  }
};