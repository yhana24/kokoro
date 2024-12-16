const axios = require("axios");
const devs = require(__dirname.replace("/script", "") + '/system/api');

module.exports["config"] = {
  name: "aidetectv2",
  version: "4.8",
  role: 0,
  credits: "Markdevs69",//api by QPAL na jaycee
  aliases: ["Aidetectv2","AIDETECTV2"],
  usage: "[prompt]",
  cd: 3,
};

module.exports["run"] = async function ({ chat, event, args, fonts }) {
  if (args.length === 0) {
    chat.reply("Please provide a question first.\n\nExample: Aidetectv2 iloveyou", event.threadID, event.messageID);
    return;
  }
  const prompt = args.join(" ");
  axios.get(`${devs.kaiz}/api/aidetector-v2?q=${encodeURIComponent(prompt)}`)
    .then(response => {
      if (response.data.message) {
  const line = "\n" + '━'.repeat(18) + "\n";
  const ai = response.data.ai;
  const human = response.data.human;
  const message = response.data.message;
  const wordcount = response.data.wordcount;
  const characters = response.data.characters;
  const aiResponse = fonts.monospace(`🕵️ | AIDETECTOR V2`) + line + fonts.thin(`Ai Generated: ${ai}\nHuman Generated: ${human}\nWordCount: ${wordcount}\nCharacters: ${characters}\nResult: ${message}`);
       chat.reply(`${aiResponse}`, event.threadID, event.messageID); 

      } else {
        chat.reply("No response from API", event.threadID, event.messageID);
      }
    })
    .catch(error => {
      chat.reply("An error occurred while processing your request, Please try again later.", event.threadID, event.messageID);
    });
};