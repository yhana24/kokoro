const axios = require("axios");
const devs = require(__dirname.replace("/script", "") + '/system/api');

module.exports["config"] = {
  name: "humanize",
  version: "4.8",
  role: 0,
  credits: "Markdevs69",//api by QPAL na jaycee
  aliases: ["Humanize","HUMANIZE"],
  usage: "[prompt]",
  cd: 3,
};

module.exports["run"] = async function ({ chat, event, args, fonts }) {
  if (args.length === 0) {
    chat.reply("Please provide a question first.\n\nExample: Humanize iloveyou", event.threadID, event.messageID);
    return;
  }
  const prompt = args.join(" ");
  axios.get(`${devs.kaiz}/api/humanizer?q=${encodeURIComponent(prompt)}`)
    .then(response => {
      if (response.data.response) {
  const line = "\n" + '━'.repeat(18) + "\n";
  const aiResponse = fonts.monospace(`📜 | HUMANIZER AI`) + line + (`${response.data.response}`);
       chat.reply(`${aiResponse}`, event.threadID, event.messageID); 

      } else {
        chat.reply("No response from API", event.threadID, event.messageID);
      }
    })
    .catch(error => {
      chat.reply("An error occurred while processing your request, Please try again later.", event.threadID, event.messageID);
    });
};