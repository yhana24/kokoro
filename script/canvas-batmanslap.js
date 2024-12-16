const {
  resolve,
  join
} = require("path");
const fs = require("fs");

module.exports["config"] = {
  name: "batmanslap",
  version: "2.0.0",
  role: 0,
  credits: "Phan Duy",
  isPrefix: true,
  info: "slap someone",
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

  let tromcho_img = await jimp.read(join(__root, "batmanslap.jpg"));
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
  tromcho_img.composite(circleOne.resize(160, 180), 370, 70).composite(circleTwo.resize(230, 250), 140, 150);

  let raw = await tromcho_img.getBufferAsync("image/png");

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
  const imagePath = resolve(dirMaterial, 'batmanslap.jpg');

  // Ensure cache/canvas directory exists
  if (!fs.existsSync(dirMaterial)) {
      fs.mkdirSync(dirMaterial, {
          recursive: true
      });
  }

  // If batmanslap.jpg doesn't exist, download it
  if (!fs.existsSync(imagePath)) {
      const axios = require("axios");
      const response = await axios.get('https://i.imgur.com/xHsaL0z.jpeg', {
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
          body: "shutup dude! " + tag,
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
      api.sendMessage("Error occurred while generating the image.",
          event.threadID,
          event.messageID);
  }
}