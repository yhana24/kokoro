const axios = require("axios");
const fs = require('fs');
const path = require('path');

module.exports["config"] = {
        name: "qwen2",
        isPrefix: false,
        version: "1.0.0",
        credits: "Kenneth Panio",
        role: 0,
        type: "artificial-intelligence",
        info: "Interact with ai Qwen2 Powered by alibaba cloud.",
        usage: "[prompt]",
        guide: "qwen2 hello how are you?",
        cd: 6
};

module.exports["run"] = async ({ chat, args, event, font, global }) => {
  const { author } = global.design;
  const { url, models } = global.api.workers.writer;
  
  const name = models[2];
  const mono = txt => font.monospace(txt);
  const { threadID, senderID } = event;
  const query = args.join(" ");

  if (!query) {
    chat.reply(mono("Please provide a question!"));
    return;
  }

  const answering = await chat.reply(mono("🕐 | Qwen2 is Typing..."));
  
  const getResponse = async () => {
      const data = new URLSearchParams({
              text: query,
              model: name,
              session_id: senderID
      });
      
      try {
              const response = await axios.post(url, data.toString(), {
                      headers: {
                              'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                              'Accept': '*/*',
                              'User-Agent': 'Mozilla/5.0 (Linux; Android 12; Infinix X669 Build/SP1A.210812.016; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/128.0.6613.14 Mobile Safari/537.36',
                              'Referer': 'https://toolbaz.com/writer/chat-gpt-alternative',
                      }
              });

      return response.data;
    } catch (error) {
      throw new Error(`Error fetching response from Qwen2 AI: ${error.message}`);
    }
  };

  const maxRetries = 3;
  let attempts = 0;
  let success = false;
  let answer = '';

  while (attempts < maxRetries && !success) {
    try {
      answer = await getResponse();
      success = true;
    } catch (error) {
      attempts++;
      if (attempts < maxRetries) {
        await answering.edit(mono(`No response from Qwen2 AI. Retrying... (${attempts} of ${maxRetries} attempts)`));
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      } else {
         answering.edit(mono(`No response from Qwen2 AI. Please try again later: ${error.message}`));
        return;
      }
    }
  }

  if (success) {
    const codeBlocks = answer.match(/```[\s\S]*?```/g) || [];
    const line = "\n" + '━'.repeat(18) + "\n";

    answer = answer.replace(/\*\*(.*?)\*\*/g, (_, text) => font.bold(text));

    const message = font.bold("🤖 | " + name.toUpperCase()) + line + answer + line;

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
