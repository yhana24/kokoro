const axios = require('axios');

let isNSFW = false;

const categories = {
  nsfw: ['waifu', 'neko', 'trap', 'blowjob'],
  sfw: ['waifu', 'neko', 'shinobu', 'megumin', 'bully', 'cuddle', 'cry', 'hug', 'awoo', 'kiss', 'lick', 'pat', 'smug', 'bonk', 'yeet', 'blush', 'smile', 'wave', 'highfive', 'handhold', 'nom', 'bite', 'glomp', 'slap', 'kill', 'kick', 'happy', 'wink', 'poke', 'dance', 'cringe']
};

module.exports["config"] = {
  name: 'anime',
  version: '1.0.0',
  info: "get random anime pictures from category of waifu.pics",
  role: 0,
  guide: 'anime sfw waifu',
  aliases: ['waifu', 'waifu.pics', 'waifupics', 'waipic'],
  usage: '[<nsfw> to toggle]'
};

const circularJsonErrorRegex = /Converting circular structure to JSON[\s\S]*TLSSocket[\s\S]*_httpMessage[\s\S]*ClientRequest[\s\S]*socket/;

module.exports["run"] = async ({ event, args, chat, font }) => {
  const { messageID } = event;
  let waipic;
  try {
    let category = args.join(' ')?.toLowerCase();

    if (category === 'nsfw') {
      isNSFW = !isNSFW;
      const message = `NSFW mode is now ${font.bold(isNSFW ? 'enabled' : 'disabled')}`;
      waipic = await chat.reply(message);
      chat.react("🔞");
      waipic.unsend(10000);
      return;
    }

    const availableCategories = isNSFW ? categories.nsfw : categories.sfw;

    if (!category) {
      const message = font.italic(`Category: ${isNSFW ? 'NSFW' : 'SFW'}\nType:\n${availableCategories.map((cat, index) => `${index + 1}. ${cat}`).join('\n')}\nUse "nsfw" to toggle`);
      waipic = await chat.reply(message);
      chat.react("🐯");
      waipic.unsend(30000);
      return;
    }

    if (!availableCategories?.includes(category)) {
      const errorMessage = `Error: "${category}" is not a valid category for ${font.bold(isNSFW ? 'NSFW' : 'SFW')} mode`;
      waipic = await chat.reply(font.italic(errorMessage));
      waipic.unsend(10000);
      return;
    }

    const choice = isNSFW ? 'nsfw' : 'sfw';
    const response = await axios.get(`https://api.waifu.pics/${choice}/${category}`);
    const image = await axios.get(response.data.url, { responseType: "stream" });

    waipic = await chat.reply({ body: font.bold(choice?.toUpperCase()), attachment: image.data });
    waipic.unsend(60000);
  } catch (error) {
    if (circularJsonErrorRegex.test(error.message)) {
      return;
    }
    chat.react("⚠️");
    waipic = await chat.reply(font.italic(`Error: ${error.message || "Possible Reason: Account Temporary Restricted can't use features like send attachment pictures,videos,gif,audio"}`));
    waipic.unsend(5000);
  }
};
