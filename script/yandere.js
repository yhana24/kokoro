const axios = require('axios');
const randomUseragent = require('random-useragent');

module.exports["config"] = {
  name: "yandere",
  credits: 'atomic-zero',
  version: "1.0.0",
  info: 'Fetches a random picture from Yandere API and provides information about it.',
  type: 'image-fetch',
  usage: "[tags]#[tags]#[tags]",
  guide: "Yandere raiden shogun,genshin impact\nYandere raiden shogun#genshin impact\nYandere raiden shogun|genshin impact\n\nResults: Rating: q\nTags: ass genshin_impact naked nipples raiden_shogun tem10 thighhighs\nSource: https: //tem10.gumroad.com/l/ghubq\nAuthor: Arsy\n\nBody: Ugh Yamete Kudasai!\nAttachment: <image>",
  aliases: ["yande", "yanderesearch", "yanderepic"],
  role: 0,
  cd: 10
};

module.exports["run"] = async function({ chat, args, font, event, global }) {
  const { messageID } = event;
  try {
    const tags = args.join('_').replace(/,|\||#|\+/g, ' ');
    const tagsOpt = tags ? `&tags=${encodeURIComponent(tags)}` : '';

    const randomPage = Math.floor(Math.random() * 10000) + 1;
    const userAgent = randomUseragent.getRandom();

    const response = await axios.get(global.api["booru"][2] + `?limit=50${tagsOpt}&page=${randomPage}`, {
      headers: {
        'User-Agent': userAgent
      }
    });

    const posts = response.data;

    const infoMSG = await chat.reply(font.monospace("Searching Yandere Pics..."));
    infoMSG.unsend(60000);
    chat.react("🥵");

    if (posts.length === 0) {
      chat.react("😔");
      chat.reply(font.italic("No images found for the provided tags."));
      return;
    }

    const post = posts[Math.floor(Math.random() * posts.length)];
    const { file_url, rating, tags: r34tags, source = 'https://www.facebook.com/100081201591674', creator_id = 'Kenneth Panio' } = post;
    const infoMessage = font.monospace(`RATED: ${rating?.toUpperCase()}\nTAGS: ${r34tags}\nAUTHOR: ${creator_id}\nSOURCE: `) + source;

    await infoMSG.edit(infoMessage, 3000);

    if (file_url) {
      const responseImage = await axios.get(file_url, { responseType: "stream" });

      if (responseImage.status === 200 && responseImage.data) {
        chat.log('Successfully fetched image from Yandere!');
        const booru = await chat.reply({
          body: "𝚈𝙰𝙽𝙳𝙴𝚁𝙴 𝙸𝙼𝙰𝙶𝙴",
          attachment: responseImage.data,
        });
        booru.unsend(60000);
      } else {
        chat.react("⚠️");
        await infoMSG.edit(font.monospace("Image is no longer available, was deleted by the author."));
      }
    }
  } catch (error) {
    const circularJsonErrorRegex = /Converting circular structure to JSON[\s\S]*TLSSocket[\s\S]*_httpMessage[\s\S]*ClientRequest[\s\S]*socket/;
    if (!circularJsonErrorRegex.test(error.message)) {
      return;
    } else {
      chat.react("⚠️");
      chat.reply(font.italic(error.message || "Possible Reason: Account Temporary Restricted can't use features like send attachment pictures,videos,gif,audio"));
    }
  }
};
