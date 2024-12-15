const axios = require('axios');
const randomUseragent = require('random-useragent');

module.exports.config = {
  name: "imagine",
  info: "Generate AI art",
  aliases: ["gen", "dream"],
  version: "1.0.1",
  type: "ai-image-generator",
  isPrefix: false,
  usage: "[model number] [prompt]",
  role: 0,
};

module.exports.run = async ({ event, args, chat, font, global }) => {
  const { api } = global;
  const { url, key, imagine } = api.workers;

  let modelIndex;
  let prompt;

  if (args.length < 1) {
    const modelList = imagine.map((model, index) => `  ${index + 1}. ${model.split('/').pop()}`).join("\n");
    chat.reply(font.monospace(`Available models:\n\n${modelList}\n\nExample: imagine 3 a dog outside house.`));
    return;
  }

  const firstArg = args[0];
  if (!isNaN(parseInt(firstArg))) {
    modelIndex = parseInt(firstArg) - 1;
    if (modelIndex < 0 || modelIndex >= imagine.length) {
      modelIndex = 0;
    }
    prompt = args.slice(1).join(" ");
  } else {
    modelIndex = imagine.findIndex(model => model.includes(`@cf/${firstArg.toLowerCase()}`));
    if (modelIndex === -1) {
      modelIndex = 0;
    }
    prompt = args.join(" ");
  }

  if (!prompt.trim()) {
    chat.reply(font.monospace(`Please provide a prompt for the selected model.`));
    return;
  }

  const selectedModel = imagine[modelIndex].split('/').pop();
  const apiUrl = url + imagine[modelIndex];

  try {
    const answering = await chat.reply(font.monospace(`Generating image with ${selectedModel} model...`));

    const response = await axios.post(apiUrl, { prompt: prompt }, {
      headers: {
        'Authorization': 'Bearer ' + (atob(key)),
        'Content-Type': 'application/json',
        'User-Agent': randomUseragent.getRandom()
      },
      responseType: 'stream'
    });

    const image = await chat.reply({ attachment: response.data });

    answering.unsend();
    image.unsend(120000);
  } catch (error) {
    chat.reply(font.monospace(`Error: ${error.message}`));
  }
};
