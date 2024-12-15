module.exports["config"] = {
  name: "image2text",
  aliases: ["img2text", "img2txt"],
  version: "1.0.0",
  role: 0,
  credits: "Kenneth Panio",
  info: "Extract text from an image using OCR",
  type: "",
  usage: "[reply to media]",
  guide: "Reply to the media with 'image2text'",
  cd: 10,
};

module.exports["run"] = async ({ chat, event }) => {
  const axios = require('axios');
  const FormData = require('form-data');
  const fs = require('fs');
  const path = require('path');

  try {
    if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
      return chat.reply('Please reply to an image');
    }

    const attachments = event.messageReply.attachments;
    const cacheDir = './cache'; // directory for caching images
    let combinedText = '';

    for (let i = 0; i < attachments.length; i++) {
      const mediaUrl = attachments[i].url;
      const mediaFileName = `${Date.now()}_${Math.floor(Math.random() * 100000)}_${i}.${mediaUrl.split('.').pop()}`;
      const mediaPath = path.join(cacheDir, mediaFileName);

      if (!fs.existsSync(mediaPath)) {
        if (!fs.existsSync(cacheDir)) {
          fs.mkdirSync(cacheDir);
        }

        const response = await axios.get(mediaUrl, { responseType: 'stream' });
        const writer = fs.createWriteStream(mediaPath);
        response.data.pipe(writer);
        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });

        chat.log(`Media ${mediaFileName} downloaded and cached.`);
      } else {
        chat.log(`Media ${mediaFileName} found in cache.`);
      }

      // Send image to text API
      const formData = new FormData();
      formData.append('image', fs.createReadStream(mediaPath));

      const textResponse = await axios.post('https://api.api-ninjas.com/v1/imagetotext', formData, {
        headers: {
          'X-Api-Key': 'MZ8Z1+hei4m0ErFEJpBnZQ==Af6bD5NYhLbAJDi4',
          ...formData.getHeaders(),
        },
      });

      const detectedText = textResponse.data;
      
// Combine detected text with spaces
combinedText += detectedText.map(({ text }) => text).join(' ') + '\n';
}

chat.reply(combinedText.trim());
    chat.log('Successfully extracted text from image(s)');
  } catch (error) {
    return chat.reply(error.message);
  }
};
