const axios = require("axios");
const fs = require("fs");
const path = require("path");
const devs = require(__dirname.replace("/script", "") + '/system/api');

module.exports["config"] = {
  name: "tiktok-memes",
  version: "1.0.0",
  role: 0,
  credits: "Mark Hitsuraan",
  info: "Random memes from TikTok",
  usage: "[tiktok-memes]",
  cd: 5,
};

module.exports["run"] = async function({ chat, event, fonts }) {
  try {
    chat.reply(fonts.thin("Searching random memes from tiktok, please wait...", event.threadID, event.messageID));

    const response = await axios.get(
      `${devs.markdevs69}/api/tiksearch?search=oceanbackgroundmemes`,
      { 
        timeout: 5000 // wait for 5 seconds max
      }
    );

    if (response.status != 200) {
      throw new Error("Server responded with non-ok status");
    }

    const videos = response.data.data.videos;
    if (!videos || videos.length === 0) {
       chat.reply(fonts.thin("No videos found.", event.threadID, event.messageID));
       return;
    }

    const videoData = videos[0];
    const videoUrl = videoData.play;
    const message = `Random Memes Results:\n\nPost by: ${videoData.author.nickname}\nUsername: ${videoData.author.unique_id}\n\nContent: ${videoData.title}`;
      const res = fonts.thin(message);
    const filePath = path.join(__dirname, `/cache/edit.mp4`);

    const videoResponse = await axios(
      {
        method: 'get',
        url: videoUrl,
        responseType: 'stream',
        timeout: 5000
      }
    );

    const writer = fs.createWriteStream(filePath);
    videoResponse.data.pipe(writer);

    writer.on('finish', () => {
      chat.reply(
        { body: res, attachment: fs.createReadStream(filePath) },
        event.threadID,
        () => fs.unlinkSync(filePath)
      );
    });

  } catch (error) {
    if (axios.isTimeout(error)) {
      chat.reply(fonts.thin("Failed to retrieve, please try again later.", event.threadID));
    } else {
      console.error('Error:', error);
      chat.reply(fonts.thin("An error occurred while processing the request.", event.threadID));
    }
  }
};