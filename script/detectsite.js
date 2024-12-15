const axios = require('axios');

module.exports = {
  config: {
    name: "detectsite",
    role: 0,
    credits: "Kenneth Panio",
    info: "Detect a website URL and take a screenshot",
  },

  handleEvent: async ({ chat, event, font, global }) => {
    try {
      const link = event.body?.split(' ')[0]?.trim(); // Check if there's an input and clean it up.
      const urlRegex = /^(https?:\/\/)?(([\w-]+\.)+[\w-]+|(\d{1,3}\.){3}\d{1,3})(:\d+)?(\/[^\s]*)?$/; // Regex to validate URL.
      const excludedExtensions = /\.(jpg|jpeg|png|gif|bmp|webp|tiff|svg|mp3|mp4|wav|ogg|webm)(\?.*)?$/i; // Exclude file extensions.
      const excludedDomains = /(facebook\.com|fb\.com|pixiv\.net|tiktok\.com)/i; // Exclude specific domains, including TikTok.

      // Validate the input link
      if (!link || !urlRegex.test(link) || excludedExtensions.test(link) || excludedDomains.test(link)) {
        return; // Exit if the link is invalid or matches the exclusions.
      }

      // Construct the screenshot URL
      const screenshotUrl = `https://image.thum.io/get/width/1920/crop/400/fullpage/noanimate/${link}`;

      const attachment = await chat.arraybuffer(screenshotUrl);

      // Check NSFW status of the screenshot
      const nsfwResponse = await axios.get(global.api.kokoro[0] + "/google", {
        params: {
          prompt: "detect",
          model: "gemini-1.5-flash",
          uid: Date.now(),
          roleplay: "As a dedicated NSFW detector, please respond exclusively with a JSON object { \"nsfw\": boolean, \"reason\": \"string\" } indicating whether the content is classified as NSFW (true or false). Additionally, provide clear information within the JSON under the key 'reason,' detailing the specific elements or characteristics that led to this classification.",
          file_url: screenshotUrl,
        }
      });


      const output = nsfwResponse.data.message.replace(/```json|```/g, '').trim();

      const nsfwData = JSON.parse(output);
      if (nsfwData.nsfw) {
        chat.reply(font.monospace(`Inappropriate content detected: ${nsfwData.reason}`));
        return; 
      }

      await chat.reply({ attachment });

    } catch (error) {
      console.error(`ERROR: ${error.message}`);
    }
  }
};