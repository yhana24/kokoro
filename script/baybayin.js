module.exports["config"] = {
  name: "baybayin",
  version: "1.0.0",
  role: 0,
  credits: "Joshua Sy",
  info: "text to baybayin",
  usages: "[text]",
  commandCategory: "...",
  cd: 5
};

module.exports["run"] = async ({ api, event, args }) => {
const axios = require("axios");
let juswa = args.join(" ");
const res = await axios.get(`https://api-baybayin-transliterator.vercel.app/?text=${juswa}`);
var a = res.data.baybayin;
return api.sendMessage(`𝗢𝗿𝗶𝗴𝗶𝗻𝗮𝗹: ${res.data.original}\n𝗖𝗼𝗻𝘃𝗲𝗿𝘁𝗲𝗱 𝘁𝗼 𝗯𝗮𝘆𝗯𝗮𝘆𝗶𝗻: ${a}`, event.threadID, event.messageID);
}