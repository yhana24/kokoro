module.exports["config"] = {
  name: "caution",
  version: "1.0.1",
  rolw: 0,
  credits: "developer",
  info: "",
  commandCategory: "image",
  usages: "text",
  cd: 0,
  dependencies: {
      "fs-extra": "",
      "request": ""
  }
};
module.exports["run"] = async ({ api, event,args }) => {  {

  const fs = require("fs-extra");
  const request = require("request");
 const { threadID, messageID, senderID, body } = event;
let juswa = args.toString().replace(/,/g,  '  ');
if (!juswa)
  return api.sendMessage("Add text lmao", event.threadID, event.messageID);

 var callback = () => api.sendMessage({body:``,attachment: fs.createReadStream(__dirname + "/cache/biden.png")}, event.threadID, () => fs.unlinkSync(__dirname + "/cache/biden.png"),event.messageID);
 return request(encodeURI(`https://api.popcat.xyz/caution?text=${juswa}`)).pipe(fs.createWriteStream(__dirname+'/cache/biden.png')).on('close',() => callback());     
}}