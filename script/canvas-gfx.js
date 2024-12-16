const request = require('request');
const fs = require("fs-extra");
const axios = require("axios");
const devs = require(__dirname.replace("/script", "") + '/system/api');

module.exports["config"] = {
  name: "gfx",
  version: "1.0.1",
  role: 0,
  credits: "Markdevs69",
  info: "gfx banner",
  usages: "[text]",
  cd: 2,
};
module.exports["run"] = async function ({ api, event, args }) {
  let { senderID, threadID, messageID } = event;
  let pathImg = __dirname + `/cache/${event.threadID}_${event.senderID}.png`;
  let text = args.join(" ");
  if (!text) return api.sendMessage(`Please provide a text!\n\nExample: gfx [text]`, event.threadID, event.messageID);
  let getWanted = (
    await axios.get(`${devs.markdevs69v2}/api/canvas/gfx1?teks=${text}`, {
      responseType: "arraybuffer",
    })
  ).data;
  fs.writeFileSync(pathImg, Buffer.from(getWanted, "utf-8"));
  return api.sendMessage(
    { attachment: fs.createReadStream(pathImg) },
    threadID,
    () => fs.unlinkSync(pathImg),
    messageID
  );
};