const axios = require('axios');
const fs = require('fs');
const path = require('path');
const getFBInfo = require("@xaviabot/fb-downloader");


module.exports.config = {
  name: "autodownload [FB/TT]",
  version: "69",
  info: "automatically downloads video url or file url and send it as attachment",
  credits: "hutchin" //optimized by kenneth panio also optimized by markdevs69
}

const downloadDirectory = path.resolve(__dirname, 'cache');

module.exports.handleEvent = async ({ api, event, fonts, chat }) => {
  if (event.body !== null) {
    const regEx_tiktok = /https:\/\/(www\.|vt\.|vm\.)?tiktok\.com\//;
    const tin = txt => fonts.thin(txt);
    const link = event.body;
    if (regEx_tiktok.test(link)) {
      api.setMessageReaction("📥", event.messageID, () => {}, true);
      try {
          chat.reply(tin(`Tiktok link detect!\n\nurl: ${link}`, event.threadID, (err, info) =>

      setTimeout(() => {

       api.unsendMessage(info.messageID) 

     }, 10000), event.messageID));
          
        const response = await axios.post(`https://www.tikwm.com/api/`, { url: link });
        const data = response.data.data;
        const videoStream = await axios({
          method: 'get',
          url: data.play,
          responseType: 'stream'
        });
        const fileName = `TikTok-${Date.now()}.mp4`;
        const filePath = path.join(downloadDirectory, fileName);
        const videoFile = fs.createWriteStream(filePath);

        videoStream.data.pipe(videoFile);

        videoFile.on('finish', () => {
          videoFile.close(() => {
            console.log('Downloaded video file.');
         //     api.setMessageReaction("✅", event.messageID, () => { }, true);

            api.sendMessage({
              body: `𝖳𝗂𝗄𝖳𝗈𝗄 \n\n𝙲𝚘𝚗𝚝𝚎𝚗𝚝: ${data.title}\n\n𝙻𝚒𝚔𝚎𝚜: ${data.digg_count}\n\n𝙲𝚘𝚖𝚖𝚎𝚗𝚝𝚜: ${data.comment_count}.`,
              attachment: fs.createReadStream(filePath)
            }, event.threadID, () => {
              fs.unlinkSync(filePath); // Delete the video file after sending it
            });
          });
        });
      } catch (error) {
        api.sendMessage(`Error when trying to download the TikTok video: ${error.message}`, event.threadID, event.messageID);
      }
    }
  }
  if (event.body !== null) {
    const tin = txt => fonts.thin(txt);
    const fbvid = path.join(downloadDirectory, 'video.mp4');


    if (!fs.existsSync(downloadDirectory)) {
      fs.mkdirSync(downloadDirectory, { recursive: true });
    }

        const facebookLinkRegex = /https:\/\/www\.facebook\.com\/\S+|https:\/\/fb\.watch/;

        const downloadAndSendFBContent = async (url) => {
          try {
            const result = await getFBInfo(url);
            let videoData = await axios.get(encodeURI(result.sd), { responseType: 'arraybuffer' });
              chat.reply(tin(`Facebook video link detect!\n\ncontent: ${result.title}`, event.threadID, (err, info) =>

   setTimeout(() => {

    api.unsendMessage(info.messageID) 

  }, 10000), event.messageID));
            fs.writeFileSync(fbvid, Buffer.from(videoData.data, "utf-8"));
            //  api.setMessageReaction("✅", event.messageID, () => { }, true);
              
            return api.sendMessage({ attachment: fs.createReadStream(fbvid) }, event.threadID, () => fs.unlinkSync(fbvid));
          }
          catch (e) {
            return console.log(e);
          }
        };

        if (facebookLinkRegex.test(event.body)) {
          downloadAndSendFBContent(event.body);
    }
  }
}
