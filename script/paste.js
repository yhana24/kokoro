
const axios = require("axios");

module.exports["config"] = {
  name: "paste",
  role: 0,
  credits: "AkhiroDEV", // modified by Kenneth Panio
  info: "Get the code through the pastebin",
  cd: 5
};

module.exports["run"] = async ({ chat, args, font }) => {
  const apiURL = args[0];
  if (!apiURL) {
    return chat.reply(font.monospace("Please provide a valid Pastebin raw link to get the code"));
  }
  if (!/^https:\/\/pastebin\.com\/raw\/[a-zA-Z0-9]{8}$/.test(apiURL)) {
    return chat.reply(font.monospace("Invalid Pastebin raw link!"));
  }
  try {
    const { data } = await axios.get(apiURL);
    chat.reply(font.monospace(data));
  } catch (error) {
    chat.reply(font.monospace(`ERROR: ${error.message}`));
  }
};
