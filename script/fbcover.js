const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");
const jimp = require("jimp");

module.exports.config = {
  name: "fbcover",
  version: "1.0.0",
  role: 0,
  credits: "Shiron",
  info: "Create a Facebook cover photo",
  type: "banner",
  cd: 0,
};

module.exports.run = async ({ chat, args, event, Utils }) => {
  const { senderID } = event;

  if (!args[0]) {
    await chat.reply("Please enter the main name!!!");
    return;
  }

  await chat.reply(
    `🔍 You chose the main name: ${args.join(" ").toUpperCase()}\n\n(Reply to this message and choose your secondary name)`
  );

  try {
    if (!Utils.handleReply) {
      Utils.handleReply = [];
    }

    Utils.handleReply.push({
      type: "tenphu",
      name: "fbcover",
      author: senderID,
      tenchinh: args.join(" ").toUpperCase(),
      messageID: event.messageID,
    });
  } catch (err) {
    console.error("Error pushing to handleReply:", err);
  }
};

module.exports.handleReply = async ({ chat, event, Utils }) => {
  const { senderID, body } = event;

  let handleReply = Utils.handleReply.find((reply) => reply.author === senderID);

  if (!handleReply) {
    return;
  }

  switch (handleReply.type) {
    case "tenphu": {
      await chat.reply(
        `🔍 You have chosen a sub-name ${body.toUpperCase()}\n\n(Reply to this message to enter your phone number)`
      );

      try {
        handleReply.tenphu = body;
        handleReply.type = "sdt";
        Utils.handleReply[Utils.handleReply.indexOf(handleReply)] = handleReply;
      } catch (err) {
        console.error("Error updating handleReply:", err);
      }
      break;
    }
    case "sdt": {
      await chat.reply(
        `🔍 You have selected SDT as : ${body.toUpperCase()}\n\n(Reply to this message to enter your email)`
      );

      try {
        handleReply.sdt = body;
        handleReply.type = "email";
        Utils.handleReply[Utils.handleReply.indexOf(handleReply)] = handleReply;
      } catch (err) {
        console.error("Error updating handleReply:", err);
      }
      break;
    }
    case "email": {
      await chat.reply(
        `🔍 You have selected email as : ${body.toUpperCase()}\n\n(Reply to this message to enter your address)`
      );

      try {
        handleReply.email = body;
        handleReply.type = "color";
        Utils.handleReply[Utils.handleReply.indexOf(handleReply)] = handleReply;
      } catch (err) {
        console.error("Error updating handleReply:", err);
      }
      break;
    }
    case "color": {
      const color = body.toLowerCase() === "no" ? "#ffffff" : body;
      await chat.reply(
        `🔍 You have chosen the address as : ${body.toUpperCase()}\n\n(Reply to this message to enter your background color (enter no as the default color)`
      );

      try {
        handleReply.diachi = body;
        handleReply.type = "create";
        Utils.handleReply[Utils.handleReply.indexOf(handleReply)] = handleReply;
      } catch (err) {
        console.error("Error updating handleReply:", err.message);
      }
      break;
    }
    case "create": {
      const pathImg = path.join(__dirname, `/cache/${senderID + 20}.png`);
      const pathAva = path.join(__dirname, `/cache/${senderID + 30}.png`);
      const pathLine = path.join(__dirname, `/cache/${senderID + 40}.png`);

      const color = handleReply.diachi.toLowerCase() === "no" ? "#ffffff" : handleReply.diachi;
      const address = handleReply.diachi.toUpperCase();
      const name = handleReply.tenchinh.toUpperCase();
      const email = handleReply.email.toUpperCase();
      const subname = handleReply.tenphu.toUpperCase();
      const phoneNumber = handleReply.sdt.toUpperCase();

      await chat.reply(`⏳ Initializing the image maker...`);

      try {
        // Download images
        const [avtAnime, background, hieuung] = await Promise.all([
          axios.get(`https://graph.facebook.com/${senderID}/picture?height=1500&width=1500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' }),
          axios.get(`https://1.bp.blogspot.com/-ZyXHJE2S3ew/YSdA8Guah-I/AAAAAAAAwtQ/udZEj3sXhQkwh5Qn8jwfjRwesrGoY90cwCNcBGAsYHQ/s0/bg.jpg`, { responseType: 'arraybuffer' }),
          axios.get(`https://1.bp.blogspot.com/-zl3qntcfDhY/YSdEQNehJJI/AAAAAAAAwtY/C17yMRMBjGstL_Cq6STfSYyBy-mwjkdQwCNcBGAsYHQ/s0/mask.png`, { responseType: 'arraybuffer' })
        ]);

        await Promise.all([
          fs.promises.writeFile(pathAva, Buffer.from(avtAnime.data, 'utf-8')),
          fs.promises.writeFile(pathImg, Buffer.from(background.data, 'utf-8')),
          fs.promises.writeFile(pathLine, Buffer.from(hieuung.data, 'utf-8'))
        ]);

        // Circle function using Jimp
        const circle = async (imagePath) => {
          const img = await jimp.read(imagePath);
          img.circle();
          return img.getBufferAsync(jimp.MIME_PNG);
        };

        const drawBanner = async () => {
          const baseImage = await loadImage(pathImg);
          const baseAva = await loadImage(await circle(pathAva));
          const baseLine = await loadImage(pathLine);

          const canvas = createCanvas(baseImage.width, baseImage.height);
          const ctx = canvas.getContext('2d');

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

          require('canvas').registerFont(path.join(__dirname, `/system/UTMAvoBold.ttf`), { family: 'UTMAvoBold' });

          ctx.strokeStyle = "rgba(255,255,255, 0.2)";
ctx.lineWidth = 3;
ctx.font = "100px UTMAvoBold";
ctx.strokeText(name, 30, 100);
ctx.strokeText(name, 130, 200);
ctx.textAlign = "right";
ctx.strokeText(name, canvas.width - 30, canvas.height - 30);
ctx.strokeText(name, canvas.width - 130, canvas.height - 130);
ctx.fillStyle = `#ffffff`
ctx.font = "55px UTMAvoBold";
ctx.fillText(name, 680, 270);
ctx.font = "40px UTMAvoBold";
ctx.fillStyle = "#fff";
ctx.textAlign = "right";
ctx.fillText(subname, 680, 320);
ctx.font = "23px UTMAvoBold";
ctx.fillStyle = "#fff";
ctx.textAlign = "start";
ctx.fillText(phoneNumber, 1350, 252);
ctx.fillText(email, 1350, 332);
ctx.fillText(address, 1350, 410);
ctx.globalCompositeOperation = "destination-out";
ctx.drawImage(baseLine, 0, 0, canvas.width, canvas.height);
ctx.globalCompositeOperation = "destination-over";
ctx.fillStyle = color
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.globalCompositeOperation = "source-over";
ctx.drawImage(baseAva, 824, 180, 285, 285);

          const buffer = canvas.toBuffer('image/png');
          await fs.promises.writeFile(path.join(__dirname, `/cache/${senderID + 50}.png`), buffer);
          await chat.reply({ attachment: fs.createReadStream(path.join(__dirname, `/cache/${senderID + 50}.png`)) });
        };

        await drawBanner();
      } catch (err) {
        console.error('Error creating banner:', err);
      }
      break;
    }
  }
};
