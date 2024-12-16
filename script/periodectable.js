module.exports["config"] = {
  name: "periodictable",
  version: "1.0.0",
  role: 0,
  credit: "Joshua Sy",
  description: "get info of element",
  commandCategory: "study",
  cd: 0,
};

module.exports["run"] = async function({api, event, args, utils, Users, Threads}) {
  try {
      let axios = require('axios');
      let fs = require("fs-extra");
      let request = require("request");
      let {threadID, senderID, messageID} = event;
      let juswa = args.join(" ");
const res = await axios.get(`https://api.popcat.xyz/periodic-table?element=${juswa}`);
console.log(res.data);
var data = res.data;
let callback = function() {
          return api.sendMessage({
              body:`Element Name: ${data.name}\nSymbol: ${data.symbol}\nAtomic Number: ${data.atomic_number}\nAtomic Mass: ${data.atomic_mass}\n\nSummary: ${data.summary}`,
              attachment: fs.createReadStream(__dirname + `/cache/image.png`)
          }, event.threadID, () => fs.unlinkSync(__dirname + `/cache/image.png`), event.messageID);
      };
  return request(encodeURI(data.image)).pipe(fs.createWriteStream(__dirname + `/cache/image.png`)).on("close", callback);
  } catch (err) {
      console.log(err)
      return api.sendMessage(`Add text lmao`, event.threadID)
  }
}