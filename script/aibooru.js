const axios = require('axios');
const randomUseragent = require('random-useragent');

module.exports["config"] = {
  name: "aibooru",
  credits: 'atomic-zero',
  version: "1.0.0",
  info: 'get random anime picture from aibooru.',
  type: 'anime',
  aliases: ["ainime", "ai-anime"],
  role: 0,
  cd: 10
};

module.exports["run"] = async ({ chat, args, event, font, global }) => {
  try {
    const { messageID } = event;
    const userAgent = randomUseragent.getRandom();
    const response = await axios.get(global.api["booru"][0], { headers: { 'User-Agent': userAgent } });
    const posts = response.data;
    const post = posts[Math.floor(Math.random() * posts.length)];
    const { file_url: defaultImageUrl, rating, tag_string: tagList, source = 'https://www.facebook.com/100081201591674', tag_string_artist: author, media_asset } = post;

    const infoMSG = await chat.reply(font.monospace("Searching AI Booru..."));
    infoMSG.unsend(60000);
    chat.react("🥵");

    const editInfo = font.monospace(`∅ RATED: ${rating.toUpperCase()}\n# TAGS: ${tagList}\n✎ AUTHOR: ${author}\n➽ SOURCE: `) + source;
    infoMSG.edit(editInfo, 5000);

    const imageVariant = media_asset?.variants?.find(variant => variant.type === 'original');
    const variantImageUrl = imageVariant?.url;

    let imageResponse, variantResponse;
    try {
      imageResponse = await axios.get(defaultImageUrl, { responseType: "stream" });
    } catch (error) {
      imageResponse = null;
    }

    if (variantImageUrl) {
      try {
        variantResponse = await axios.get(variantImageUrl, { responseType: "stream" });
      } catch (error) {
        variantResponse = null;
      }
    }

    const imageStream = imageResponse?.data;
    const variantStream = variantResponse?.data;
    const validVariant = variantResponse?.status === 200 && variantStream;

    const streamToUse = validVariant ? variantStream : imageStream;
    const imageUrlToUse = validVariant ? variantImageUrl : defaultImageUrl;

    if (streamToUse) {
      chat.log('Successfully Fetched Image!');
      const booru = await chat.reply({ body: "🥵 𝙰𝙸𝙱𝙾𝙾𝚁𝚄 𝙸𝙼𝙰𝙶𝙴", attachment: streamToUse });
      booru.unsend(60000);
    } else {
      chat.react("⚠️");
      infoMSG.edit(font.monospace(`Image is no longer available, was deleted by the author.`));
    }
  } catch (error) {
    chat.react("⚠️");
    chat.reply(font.italic(error.message || "Possible Reason: Account temporarily restricted, can't use features like sending attachments (pictures, videos, GIFs, audio)."));
  }
};
