module.exports["config"] = {
  name: "rizz",
  aliases: ["pickup", "pickupline", "pickup-line"],
  info: "get random pickupline for fun",
  isPrefix: false,
  version: "1.0.0",
  cd: 8,
};

module.exports["run"] = async ({ chat, font, event }) => {
  const { get } = require("axios");
  try {
  const rizz = await get("https://rizzapi.vercel.app/random");
  chat.reply(font.monospace(rizz.data.text), event.threadID, event.messageID);
  } catch(error) {
    chat.reply(font.monospace(error.message));
  }
}
