const {
  resolve,
  join
} = require("path");
const fs = require("fs");

module.exports["config"] = {
  name: "fuck",
  version: "2.0.0",
  role: 0,
  credits: "developer",
  info: "memes",
  usages: "[tag]",
  cd: 5
};

async function makeImage( {
  one, two
}) {
  const path = require("path");
  const axios = require("axios");
  const jimp = require("jimp");
  const __root = path.resolve(__dirname, "cache", "canvas");

  // Ensure cache/canvas directory exists
  if (!fs.existsSync(__root)) {
      fs.mkdirSync(__root, {
          recursive: true
      });
  }

  let batgiam_img = await jimp.read(join(__root, "fuck.png"));
  let pathImg = join(__root, `tromcho_${one}_${two}.png`);
  let avatarOne = join(__root, `avt_${one}.png`);
  let avatarTwo = join(__root, `avt_${two}.png`);

  let getAvatarOne = (await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, {
      responseType: 'arraybuffer'
  })).data;
  fs.writeFileSync(avatarOne, Buffer.from(getAvatarOne, 'utf-8'));

  let getAvatarTwo = (await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, {
      responseType: 'arraybuffer'
  })).data;
  fs.writeFileSync(avatarTwo, Buffer.from(getAvatarTwo, 'utf-8'));

  let circleOne = await jimp.read(await circle(avatarOne));
let circleTwo = await jimp.read(await circle(avatarTwo));
batgiam_img.composite(circleOne.resize(100, 100), 20, 300).composite(circleTwo.resize(150, 150), 100, 20);

  let raw = await batgiam_img.getBufferAsync("image/png");

  fs.writeFileSync(pathImg, raw);
  fs.unlinkSync(avatarOne);
  fs.unlinkSync(avatarTwo);

  return pathImg;
}

async function circle(image) {
  const jimp = require("jimp");
  image = await jimp.read(image);
  image.circle();
  return await image.getBufferAsync("image/png");
}

module.exports["run"] = async function ({
  event, api, chat
}) {
  const dirMaterial = resolve(__dirname, 'cache', 'canvas');
  const imagePath = resolve(dirMaterial, 'fuck.png');

  // Ensure cache/canvas directory exists
  if (!fs.existsSync(dirMaterial)) {
      fs.mkdirSync(dirMaterial, {
          recursive: true
      });
  }

  // If batmanslap.jpg doesn't exist, download it
  if (!fs.existsSync(imagePath)) {
      const axios = require("axios");
      const response = await axios.get('https://i.ibb.co/TW9Kbwr/images-2022-08-14-T183542-356.jpg', {
          responseType: 'arraybuffer'
      });
      fs.writeFileSync(imagePath, response.data);
  }

  const {
      senderID
  } = event;
  var mention = Object.keys(event.mentions)[0] || null;

  if (!mention) {
      return api.sendMessage("Please tag 1 person", event.threadID, event.messageID);
  }

  try {
      var tag = await chat.userName(mention);

      // Proceed with image generation
      var one = senderID,
      two = mention;
      const imagePath = await makeImage({
          one, two
      });
      api.sendMessage({
          body: "U*g Sge pa! " + tag,
          mentions: [{
              tag: tag,
              id: mention
          }],
          attachment: fs.createReadStream(imagePath)
      }, event.threadID, () => {
          if (fs.existsSync(imagePath)) {
              fs.unlinkSync(imagePath);
          }
      },
          event.messageID);
  } catch (error) {
      api.sendMessage(error.message,
          event.threadID,
          event.messageID);
  }
}