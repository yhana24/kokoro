const axios = require('axios');
const fs = require('fs');
const path = require('path');

const MAX_FILE_SIZE_MB = 25;
const MAX_COUNT = 10;
let NSFW = false;

module.exports["config"] = {
  name: '4chan',
  aliases: ['civitai', 'civit.ai', 'random-nsfw'],
  version: '4.0.0',
  role: 0,
  credits: 'Kenneth Panio',
  info: 'Get random uploaded content from civit.ai',
  type: 'nsfw',
  usage: '[count] or nsfw',
  cd: 5,
};

const getRandomElement = array => array[Math.floor(Math.random() * array.length)];

const getFileExtension = contentType => {
  const extensions = {
    'image/jpeg': 'png',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/bmp': 'png',
    'image/webp': 'png',
    'video/mp4': 'mp4',
    'video/webm': 'mp4',
    'video/quicktime': 'mp4',
  };
  return extensions[contentType] || 'unknown';
};

module.exports["run"] = async function ({ api, event, args, chat, font }) {
  var mono =  txt => font.monospace(txt);
  const reply = async (msg, unsendTime = 5000) => {
    const msgInfo = await chat.reply(msg);
    if (unsendTime > 0) msgInfo.unsend(unsendTime);
  };
  if (args[0] && args[0]?.toLowerCase() === 'nsfw') {
    NSFW = !NSFW;
    const statusMsg = NSFW ? 'NSFW mode is now ON.' : 'NSFW mode is now OFF.';
    await reply(mono(statusMsg));
    return;
  } else { 
    await reply(mono('🕜 | Fetching random image from civitai...'));
    chat.react("🥵");
  }

  const cnt = parseInt(args[0]) || 4;

  if (cnt <= 0 || cnt > MAX_COUNT) {
    await reply(mono(`Invalid count. Please provide a count between 1 and ${MAX_COUNT}.`));
    return;
  }

  const Media = [];
  const usedCombos = new Set();

  try {
    const baseUrl = 'https://civitai.com/api/v1/images';
    const cacheDir = path.join(__dirname, '/cache');

    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir);
    }

    const downloadAndSaveMedia = async (mediaUrl, index) => {
      try {
        const response = await axios.get(mediaUrl, { responseType: 'stream' });
        const contentType = response.headers['content-type'];
        const contentExtension = getFileExtension(contentType);

        if (contentExtension === 'unknown') {
          chat.log(`Skipped: ${mediaUrl} - Unknown content type`);
          return null;
        }

        const mediaPath = path.join(cacheDir, `civ_${index + 1}.${contentExtension}`);
        const fileStream = fs.createWriteStream(mediaPath);

        response.data.pipe(fileStream);

        return new Promise((resolve, reject) => {
          fileStream.on('finish', () => resolve({ stream: fs.createReadStream(mediaPath), contentType, contentExtension, path: mediaPath }));
          fileStream.on('error', reject);
        });

      } catch (error) {
        chat.error("Error downloading and saving media:" + error.message);
        return null;
      }
    };

    const getRandomCombinations = () => {
      const minPage = 1;
      const maxPage = 2;
      const randPage = Math.floor(Math.random() * (maxPage - minPage + 1)) + minPage;
      const randSort = getRandomElement(['Newest', 'Most Reactions', 'Most Comments']);
      const randPeriod = getRandomElement(['AllTime', 'Year', 'Week', 'Day']);

      return { randPage, randSort, randPeriod };
    };

    for (let i = 0; i < cnt; i++) {
      let uniqueComboFound = false;

      while (!uniqueComboFound) {
        const { randPage, randSort, randPeriod } = getRandomCombinations();
        const comboKey = `${randPage}_${randSort}_${randPeriod}`;

        if (!usedCombos.has(comboKey)) {
          usedCombos.add(comboKey);
          uniqueComboFound = true;

          try {
            const response = await axios.get(baseUrl, {
              params: {
                page: randPage,
                nsfw: NSFW,
                limit: 100,
                sort: randSort,
                period: randPeriod,
              },
            });

            if (response.data && response.data.items && response.data.items.length > 0) {
              const randIndex = Math.floor(Math.random() * response.data.items.length);
              const randMedia = response.data.items[randIndex];
              const mediaUrl = randMedia.url;

              const downloadedMedia = await downloadAndSaveMedia(mediaUrl, i);

              if (downloadedMedia) {
                Media.push(downloadedMedia);
              }
            } else {
              await reply(mono("No data from civitai found!"));
            }
          } catch (error) {
            chat.error("Error from API: " + error.message);
          }
        }
      }
    }

    const sendMediaMsgs = async (type, attachments) => {
      if (attachments.length > 0) {
        const pictureAttachments = attachments.filter(item =>
          item.contentType.startsWith('image/') && !['video/mp4', 'video/webm']?.includes(item.contentType)
        );

        const videoAttachments = attachments.filter(item =>
          ['video/mp4', 'video/webm']?.includes(item.contentType)
        );

        const gifAttachments = attachments.filter(item =>
          item.contentType === 'image/gif'
        );

        if (pictureAttachments.length > 0) {
          await reply({
            body: mono("IMAGE"),
            attachment: pictureAttachments.map(item => item.stream),
          }, 60000);

          pictureAttachments.forEach(item => fs.unlinkSync(item.path));
        }

        // Send GIFs one by one
        for (const gif of gifAttachments) {
          await reply({
            body: mono("GIF"),
            attachment: gif.stream
          }, 60000);

          fs.unlinkSync(gif.path);
        }

        // Send Videos one by one
        for (const video of videoAttachments) {
          await reply({
            body: mono("VIDEO"),
            attachment: video.stream
          }, 360000);

          fs.unlinkSync(video.path);
        }
        
        const filesInCache = fs.readdirSync(cacheDir);
        filesInCache.forEach(file => {
          const filePath = path.join(cacheDir, file);
          fs.unlinkSync(filePath);
        });
      }
    };

    await sendMediaMsgs('Media', Media);

  } catch (error) {
     chat.error("Something Went wrong from 4chan cmd: " + error.message);
     return;
  }
};