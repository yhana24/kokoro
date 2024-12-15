const path = require('path');
const axios = require("axios");
const fs = require("fs-extra");
const ytdl = require("ytdl-core");
const yts = require("yt-search");

module.exports["config"] = {
  name: "music",
  version: "1.0.0",
  role: 0,
  aliases: ['play', 'sing', 'song', 'lyrics', 'kanta', 'lyric'],
  usage: '[title]',
};

module.exports["run"] = async function ({ api, event, args }) {
  const musicName = args.join(' ');
  
  if (!musicName) {
    api.sendMessage(`To get started, type music and the title of the song you want.`, event.threadID, event.messageID);
    return;
  }
  
  try {
    api.sendMessage(`Searching for "${musicName}"...`, event.threadID, event.messageID);
    const response = await axios.get(`https://lyrist.vercel.app/api/${encodeURIComponent(musicName)}`);
    const searchResults = await yts(musicName);
    
    if (!searchResults.videos.length) {
      return api.sendMessage("Can't find the search.", event.threadID, event.messageID);
    } else {
      const lyrics = response.data.lyrics;
      const title = response.data.title;
      const artist = response.data.artist;
      const music = searchResults.videos[0];
      const musicUrl = music.url;
      const stream = ytdl(musicUrl, { filter: "audioonly" });
      const time = new Date();
      const timestamp = time.toISOString().replace(/[:.]/g, "-");
      const filePath = path.join(__dirname, 'cache', `${timestamp}_music.mp3`);
      
      stream.pipe(fs.createWriteStream(filePath));
      stream.on('response', () => {});
      stream.on('info', (info) => {});
      
      stream.on('end', () => {
        if (fs.statSync(filePath).size > 26214400) {
          fs.unlinkSync(filePath);
          return api.sendMessage('The file could not be sent because it is larger than 25MB.', event.threadID);
        }
        
        const message = {
          body: `${title}`,
          attachment: fs.createReadStream(filePath)
        };
        
        api.sendMessage(`🎵 𝗟𝗬𝗥𝗜𝗖𝗦: ${title || 'Title not found or music might not existed!'}\n\n${lyrics || 'Lyrics Not Found!'}\n\n👤 𝗦𝗜𝗡𝗚𝗘𝗥: ${artist || 'Unknown can\'t find real artist'}`, event.threadID, event.messageID);
        
        api.sendMessage(message, event.threadID, () => {
          fs.unlinkSync(filePath);
        }, event.messageID);
      });
    }
  } catch (error) {
    api.sendMessage('An error occurred while processing your request.', event.threadID, event.messageID);
  }
};
