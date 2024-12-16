module.exports["config"] = {
  name: "catfact",
  version: "1.0.0",
  role: 0,
  credits: "developer",
  info: "Random Cat Fact",
  commandCategory: "random",
  usages: "catfact",
  cd: 2,
};
module.exports["run"] = async function({ chat, api, event, args, fonts }) {
const axios = require("axios");
let { messageID, threadID, senderID, body } = event;
const response = args.join(" ");
try {
const res = await axios.get(`https://catfact.ninja/fact`);
var respond = res.data.fact;
chat.reply(fonts.monospace("Cat Fact:\n " + respond, threadID , messageID));
} catch (error) {
chat.reply("An error occurred while making the API request.", threadID , messageID);
}
};