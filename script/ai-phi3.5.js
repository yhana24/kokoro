const axios = require("axios");
const fs = require('fs');
const path = require('path');

module.exports["config"] = {
  name: "phi",
  aliases: ["phi-3.5", "phi3.5"],
  isPrefix: false,
  version: "1.0.0",
  credits: "Kenneth Panio",
  role: 0,
  type: "artificial-intelligence",
  info: "Interact with PHI 3.5 AI chatbot.",
  usage: "[prompt]",
  guide: "phi hello how are you?",
  cd: 6
};

module.exports["run"] = async ({ chat, args, event, font, global }) => {
  const { author } = global.design;
  const { key, models } = global.api.workers.huggingface;
  const mistral_model = models.microsoft[2];
  const name = mistral_model.split('/').pop().toUpperCase();
  const mono = txt => font.monospace(txt);
  const { threadID, senderID } = event;
  const query = args.join(" ");

  if (!query) {
    chat.reply(mono("Please provide a question!"));
    return;
  }

  const answering = await chat.reply(mono("🕐 | PHI 3.5 is Typing..."));
  
  const getResponse = async () => {
    try {
      const response = await axios.post(`https://api-inference.huggingface.co/models/${mistral_model}/v1/chat/completions`, {
        model: mistral_model,
        messages:  [{ role: "user", content: query }],
        max_tokens: 32752,
        stream: false,
      }, {
        headers: {
          'Authorization': `Bearer ${atob(key)}`,
          'Content-Type': 'application/json',
         }
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      throw new Error(`Error fetching response from PHI 3.5 AI: ${error.message}`);
    }
  };

  const maxRetries = 3;
  let attempts = 0;
  let success = false;
  let answer = "Under Maintenance!\n\nPlease use other models get started with 'help'";

  while (attempts < maxRetries && !success) {
    try {
      answer = await getResponse();
      success = true;
    } catch (error) {
      attempts++;
      if (attempts < maxRetries) {
        await answering.edit(mono(`No response from PHI 3.5 AI. Retrying... (${attempts} of ${maxRetries} attempts)`));
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      } else {
         answering.edit(mono(`No response from PHI 3.5 AI. Please try again later: ${error.message}`));
        return;
      }
    }
  }

  if (success) {
    const codeBlocks = answer.match(/```[\s\S]*?```/g) || [];
    const line = "\n" + '━'.repeat(18) + "\n";

    answer = answer.replace(/\*\*(.*?)\*\*/g, (_, text) => font.bold(text));

    const message = font.bold("🤖 | " + name) + line + answer + line;

    await answering.edit(message);

    if (codeBlocks.length > 0) {
      const allCode = codeBlocks.map(block => block.replace(/```/g, '').trim()).join('\n\n\n');
      const cacheFolderPath = path.join(__dirname, "cache");

      if (!fs.existsSync(cacheFolderPath)) {
        fs.mkdirSync(cacheFolderPath);
      }

      const uniqueFileName = `code_snippet_${Math.floor(Math.random() * 1e6)}.txt`;
      const filePath = path.join(cacheFolderPath, uniqueFileName);

      fs.writeFileSync(filePath, 'utf8');

      const fileStream = fs.createReadStream(filePath);
      await chat.reply({ attachment: fileStream });

      fs.unlinkSync(filePath);
    }
  }
};
