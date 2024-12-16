const axios = require("axios");
const devs = require(__dirname.replace("/script", "") + '/system/api');

//https://markdevs-last-api-s7d0.onrender.com/catgpt?query=hi

module.exports["config"] = {
  name: "catgpt",
  version: "4.8",
  role: 0,
  credits: "Markdevs69",
  aliases: ["Catgpt","CATGPT"],
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
  axios.get(`${devs.markdevs69}/catgpt?query=${encodeURIComponent(content)}`)
    .then(response => {
      if (response.data.respond) {
        const aiResponse = response.data.respond.replace(/\*\*(.*?)\*\*/g, (_, text) => fonts.bold(text));
        const endTime = new Date();
  const time = (endTime - startTime) / 10000;
  const TIMES = fonts.monospace(`${time.toFixed(2)}s`);
        api.sendMessage(`😺 | 𝗖𝗔𝗧𝗚𝗣𝗧 ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎  ‎ /‎${TIMES}\n\n${aiResponse}\n\nCHAT ID: ${uid}`, event.threadID, event.messageID); 

      } else {
        api.sendMessage("No response from catgpt", event.threadID, event.messageID);
      }
    })
    .catch(error => {
      console.error("🤖 Error:", error);
      api.sendMessage("An error occurred while processing your request, Please try again later.", event.threadID, event.messageID);
    });
};