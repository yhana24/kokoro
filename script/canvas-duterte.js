const {
  createCanvas,
  loadImage
} = require('canvas');
const fs = require('fs-extra');
const axios = require('axios');
//const request = require('request');
//const Canvas = require('canvas');

module.exports["config"] = {
    name: "duterte",
    version: "1.0",
    role: 0,
    credits: "Markdevs69",
    info: "Duterte Memes",
    usage: "[text]",
    cd: 5
};

const wrapText = (ctx, text, maxWidth) => {
    return new Promise(resolve => {
        if (ctx.measureText(text).width < maxWidth) return resolve([text]);
        if (ctx.measureText('W').width > maxWidth) return resolve(null);
        const words = text.split(' ');
        const lines = [];
        let line = '';
        while (words.length > 0) {
            let split = false;
            while (ctx.measureText(words[0]).width >= maxWidth) {
                const temp = words[0];
                words[0] = temp.slice(0, -1);
                if (split) words[1] = `${temp.slice(-1)}${words[1]}`;
                else {
                    split = true;
                    words.splice(1, 0, temp.slice(-1));
                }
            }
            if (ctx.measureText(`${line}${words[0]}`).width < maxWidth) line += `${words.shift()} `;
            else {
                lines.push(line.trim());
                line = '';
            }
            if (words.length === 0) lines.push(line.trim());
        }
        return resolve(lines);
    });
}

module.exports["run"] = async function({ api, event, args, botname}) {
  const { senderID, messageID, threadID } = event;
 let pathImg = __dirname + '/cache/caye1.png';
  var text = args.join(" ");
  if (!text) return api.sendMessage(`Please enter some content`, event.threadID, event.messageID);
  let getPorn = (await axios.get(`https://i.imgflip.com/788m25.jpg`, { responseType: 'arraybuffer' })).data;
  fs.writeFileSync(pathImg, Buffer.from(getPorn, 'utf-8'));
  let baseImage = await loadImage(pathImg);
  let canvas = createCanvas(baseImage.width, baseImage.height);
  let ctx = canvas.getContext("2d");
  ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
  ctx.font = "600 50px Arial";
  ctx.fillStyle = "#000000";
  ctx.textAlign = "start";
  let fontSize = 100;
  while (ctx.measureText(text).width > 800) {
    fontSize--;
    ctx.font = `150 ${fontSize}px Arial, sans-serif`;
  }
  const lines = await wrapText(ctx, text, 700);
  ctx.fillText(lines.join('\n'), 50, 110);//comment
  ctx.beginPath();
  const imageBuffer = canvas.toBuffer();
  fs.writeFileSync(pathImg, imageBuffer);
  return api.sendMessage(
    { attachment: fs.createReadStream(pathImg) },
    event.threadID,
    () => fs.unlinkSync(pathImg),
    event.messageID
  );
};