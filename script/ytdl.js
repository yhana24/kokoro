const fs = require("fs");
const axios = require("axios");
const path = require("path");
const ytdl = require("ytdl-core");


module.exports["config"] = {
    name: "ytdl",
    version: "1.0",
    hasPermission: 0,
    role: 0,
    credits: "Neth",
    description: "Downloads yt videos",
    usages: "ytdl [YouTube link]",
    usePrefix: true,
};

module.exports["run"] = async function ({ api, event, args }) {
    try {
      const arg = args.join(' ');
      if (!arg){
        api.sendMessage(`Please provide a YouTube video link.`, event.threadID, event.messageID);
        return;
      } 

      const info1 = await new Promise(resolve => {
        api.sendMessage("⏳ Please wait...", event.threadID, (err, info1) => {
        resolve(info1);
       }, event.messageID);
      });

        ytdl.getInfo(arg).then((info) => {
          // Select the video format and quality
          const format = ytdl.chooseFormat(info.formats,{quality:"18"});
          const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
            const pathh = __dirname + '/cache/' + `${timestamp}_youtubevideo.mp4`;

          const outputStream = fs.createWriteStream(pathh);
          // Create a write stream to save the video file
          axios.head(format.url).then((res) => {
            if (res.headers['content-length'] > 1024*1024*40){
              api.setMessageReaction("❌", event.messageID, () => {}, true);
              api.editMessage("❌ Limit is only at 40MB. File too big, try again on another video.", info1.messageID);
                fs.unlinkSync(pathh);
                return;
            } else {
              api.setMessageReaction("⏳", event.messageID, () => {}, true);
              api.editMessage(`⏳ Downloading video...`, info1.messageID);
ytdl.downloadFromInfo(info, { format: format }).pipe(outputStream);
                         outputStream.on('finish', (data) => {

              outputStream.close(() => {
                              api.setMessageReaction("✅", event.messageID, () => {}, true);
api.editMessage(`✅ Downloaded! It will send the downloaded video shortly.`, info1.messageID);
                              api.sendMessage({
                              body: `✅ YouTube Video Downloaded Successfully`,
                              attachment: fs.createReadStream(pathh)
                              }, event.threadID, () => {
                              fs.unlinkSync(pathh);
                              }, event.messageID);
                          });
                        });

        }

          });
          }).catch((err) => {
            console.error(err);
              api.sendMessage("Error ❌", event.threadID);
          });

      } catch (err) {
        console.error(err);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
        api.sendMessage(`An error occurred while processing your request.`, event.threadID, event.messageID);
    }
};