module.exports["config"] = {
  name: "bogart",
  role: 0,
  credits: "Cliff",
  info: `bogart canvas`,
  usages: "[Text]",
  cd: 5,
  aliases: [],
};

module.exports["run"] = async function({ api, event, args }) {	
    const fs = require("fs-extra");
    const axios = require("axios");
    const pathImg = __dirname + '/cache/bogart.png';
    const text = args.join(" ");

    if (!text) return api.sendMessage("please provide a text", event.threadID, event.messageID);	

    try {
        const response = await axios.get(`${devs.cliffcan}/bogart?text=${encodeURIComponent(text)}`, { responseType: 'arraybuffer' });

        await fs.writeFile(pathImg, response.data);

        return api.sendMessage({ attachment: fs.createReadStream(pathImg) }, event.threadID, () => fs.unlinkSync(pathImg), event.messageID);
    } catch (error) {
        return api.sendMessage("API SUCKS", event.threadID, event.messageID);
    }        
}