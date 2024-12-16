const axios = require("axios");
const fs = require("fs");
const path = require("path");
const devs = require(__dirname.replace("/script", "") + '/system/api');

module.exports["config"] = {
  name: "tiktok-search",
  version: "1.0.0",
  role: 0,
  credits: "Mark Hitsuraan",
  info: "tiktok search",
  usage: "[search]",
  cd: 5,
};

module.exports["run"] = async function({ chat, event, args, fonts }) {
  try {
    const searchQuery = args.join(" ");
    if (!searchQuery) {
      chat.reply(fonts.thin("Usage: tiktok-search [search query]", event.threadID));
      return;
    }

    chat.reply(fonts.thin("Searching, please wait...", event.threadID));

    const response = await axios.get(`${devs.markdevs69}/api/tiksearch?search=${encodeURIComponent(searchQuery)}`);
    const videos = response.data.data.videos;

    if (!videos || videos.length === 0) {
      chat.reply(fonts.thin("No videos found for the given search query.", event.threadID));
      return;
    }

    const videoData = videos[0];
    const videoUrl = videoData.play;

    const message = `𝗧𝗶𝗸𝗧𝗼𝗸 𝗿𝗲𝘀𝘂𝗹𝘁𝘀:\n\n𝗣𝗼𝘀𝘁 𝗯𝘆: ${videoData.author.nickname}\n𝗨𝘀𝗲𝗿𝗻𝗮𝗺𝗲: ${videoData.author.unique_id}\n\n𝗧𝗶𝘁𝘁𝗹𝗲: ${videoData.title}`;

    const filePath = path.join(__dirname, `/cache/tiktok_video.mp4`);
    const writer = fs.createWriteStream(filePath);

    const videoResponse = await axios({
      method: 'get',
      url: videoUrl,
      responseType: 'stream'
    });

    videoResponse.data.pipe(writer);

    writer.on('finish', () => {
      chat.reply(
        { body: message, attachment: fs.createReadStream(filePath) },
        event.threadID,
        () => fs.unlinkSync(filePath)
      );
    });
  } catch (error) {
    console.error('Error:', error);
    chat.reply("An error occurred while processing the request.", event.threadID);
  }
};