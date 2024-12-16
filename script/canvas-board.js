const {
  createCanvas,
  loadImage
} = require('canvas');
const fs = require('fs-extra');
const axios = require('axios');
//const request = require('request');
//const Canvas = require('canvas');

module.exports["config"] = {
    name: "board",
    version: "1.0",
    role: 0,
    credits: "Markdevs69",
    info: "blackboard",
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
  const { senderID } = event;
  const pathImg = __dirname + '/cache/bang.png';// rename the file as you like
  const text = args.join(" ");
  if (!text) return api.sendMessage("Enter the content of the comment on the board", event.threadID, event.messageID);
  const getPorn = (await axios.get(`https://i.imgur.com/Jl7sYMm.jpeg`, { responseType: 'arraybuffer' })).data; // photo link
  fs.writeFileSync(pathImg, Buffer.from(getPorn, 'utf-8'));
  const baseImage = await loadImage(pathImg);
  const canvas = createCanvas(baseImage.width, baseImage.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
  ctx.font = "bold 20px Valera";
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "start";
  const fontSize = 20;
  while (ctx.measureText(text).width > 2250) {
    fontSize--;
    ctx.font = `bold ${fontSize}px Valera, sans-serif`;
  }
  const lines = await wrapText(ctx, text, 440);
  ctx.fillText(lines.join('\n'), 85,100);//comment position
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