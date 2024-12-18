const config = {
  name: "pexels",
  version: "1.0",
  credits: "Kenneth Aceberos",
  description: "Search images based on Pexels",
  role: 0,
  hasPrefix: false,
  cooldown: 5,
};

const axios = require("axios");
const fs = require("fs");

module.exports = {
  config,
  async run({ api, event, args, prefix, Utils }) {
    const input = args.join(" ");
    if (!input)
      return api.sendMessage(
        `Invalid args ❌\nUsage: pexel [search]`,
        event.threadID,
        event.messageID
      );

    api.sendMessage(`Searching for: ${input}...`, event.threadID, event.messageID);

    try {
      const response = await axios.get(
        "https://betadash-api-swordslush.vercel.app/image",
        { params: { search: input } }
      );

      const { images: result } = response.data;

      if (result.length === 0)
        return api.sendMessage(`${input} not found.`, event.threadID, event.messageID);

      const images = [];
      const paths = [];

      for (const pexel of result) {
        const path = `${__dirname}/cache/${Math.random().toString(36).substring(2)}.png`;
        const image = await axios.get(pexel, { responseType: "arraybuffer" });
        fs.writeFileSync(path, Buffer.from(image.data, "utf-8"));
        images.push(fs.createReadStream(path));
        paths.push(path);
      }

      api.sendMessage(
        { body: `Searched for: ${input}\nHere are your images!`, attachment: images },
        event.threadID,
        () => {
          for (const path of paths) {
            fs.unlinkSync(path);
          }
        },
        event.messageID
      );
    } catch (error) {
      api.sendMessage(error.message, event.threadID);
      console.error(error);
    }
  },
};
