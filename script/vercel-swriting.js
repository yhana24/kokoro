module.exports["config"] = {
    name: "snow-writing",
    version: "1.0.1",
    role: 0,
    credits: "cliff",
    description: "Generates a snow-writing image with the provided text.",
    commandCategory: "game",
    usages: "[text1] [text2]",
    cooldowns: 5,
};

module.exports["run"] = async function({ api, event, args }) {
    const fs = require("fs-extra");
    const axios = require("axios");
    const pathImg = __dirname + '/cache/e.png';
    const nya = args.join(" ");

    const [text1, text2] = nya.split(" ");

    if (!text1 || !text2) {
        return api.sendMessage("Please provide two texts separated by a space.", event.threadID, event.messageID);
    }

    try {
        const response = await axios.get(`https://api-canvass.vercel.app/snow-writing?text1=${encodeURIComponent(text1)}&text2=${encodeURIComponent(text2)}`, { responseType: 'arraybuffer' });

        await fs.writeFile(pathImg, response.data);

        return api.sendMessage({ attachment: fs.createReadStream(pathImg) }, event.threadID, () => fs.unlinkSync(pathImg), event.messageID);
    } catch (error) {
        return api.sendMessage("API SUCKS", event.threadID, event.messageID);
    }
}
