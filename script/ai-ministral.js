const axios = require("axios");
const devs = require(__dirname.replace("/script", "") + '/system/api');
//https://kaiz-apis.gleeze.com/api/ministral-3b?q=hi&uid=1

module.exports["config"] = {
  name: "ministral",
  version: "4.8",
  role: 0,
  credits: "Markdevs69",
  aliases: ["Ministral","MINISTRAL"],
  usage: "[prompt]",
  cd: 3,
};

module.exports["run"] = async function ({ api, event, args, fonts }) {
  const startTime = new Date();

  if (args.length === 0) {
    api.sendMessage("Please provide a question first.", event.threadID, event.messageID);
    return;
  }
  const content = args.join(" ");
  const uid = event.senderID;
  axios.get(`${devs.kaiz}/api/ministral-3b?q=${encodeURIComponent(content)}&uid=${uid}`)
    .then(response => {
      if (response.data.content) {
        const aiResponse = response.data.content.replace(/\*\*(.*?)\*\*/g, (_, text) => fonts.bold(text));
        const endTime = new Date();
  const time = (endTime - startTime) / 10000;
  const TIMES = fonts.monospace(`${time.toFixed(2)}s`);
        api.sendMessage(`   ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎  ‎${TIMES}\n\n${aiResponse}\n\nCHAT ID: ${uid}`, event.threadID, event.messageID); 

      } else {
        api.sendMessage("No response from API", event.threadID, event.messageID);
      }
    })
    .catch(error => {
      console.error("🤖 Error:", error);
      api.sendMessage("An error occurred while processing your request, Please try again later.", event.threadID, event.messageID);
    });
};