const request = require("request");
const fs = require("fs")
const axios = require("axios")
module.exports["config"] = {
  name: "slap",
  version: "3.0.0",
  role: 0,
  credits: `Developer`,
  info: "it's just imitated because the old slap doesn't work",
  usages: "[tag]",
  cd: 5,
};

module.exports["run"] = async({ api, event, chat }) => {
  var link = [ "https://i.postimg.cc/1tByLBHM/anime-slap.gif", ];
  var mention = Object.keys(event.mentions)[0] || event.senderID;
  var tag = await chat.userName(mention);
    if (!mention) return api.sendMessage("Mention 1 person that you want to slap", event.threadID, event.messageID);
   var callback = () => api.sendMessage({body:`Slapped! ${tag}` + `\n\n*sorry, i thought there's mosquito in ur ugly face*`,mentions: [{tag: tag,id: Object.keys(event.mentions)[0]}],attachment: fs.createReadStream(__dirname + "/cache/slap.gif")}, event.threadID, () => fs.unlinkSync(__dirname + "/cache/slap.gif"));  
      return request(encodeURI(link[Math.floor(Math.random() * link.length)])).pipe(fs.createWriteStream(__dirname+"/cache/slap.gif")).on("close",() => callback());
}