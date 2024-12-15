const axios = require("axios");
const fs = require('fs');
const path = require('path');

module.exports["config"] = {
  name: "hercai",
  aliases: ["herc"],
  version: "1.0.0",
  credits: "Kenneth Panio",
  role: 0,
  isPrefix: false,
  type: "artificial-intelligence",
  info: "Interact with hercai gpt4-ai.",
  usage: "[prompt]",
  guide: "hercai How does nuclear fusion work?",
  cd: 6
};

module.exports["run"] = async ({ chat, args, event, font }) => {
  const mono = txt => font.monospace(txt);
  const { threadID, senderID } = event;
  const query = args.join(" ");

  if (!query) {
    await chat.reply(mono("Please provide a question!"));
    return;
  }

  const answering = await chat.reply(mono("🕐 | Answering..."));

  const maxRetries = 3;
  let attempts = 0;
  let success = false;
  let answer = "Under Maintenance!\n\nPlease use other models get started with 'help'";

  while (attempts < maxRetries && !success) {
    try {
      const response = await axios.get("https://hercai.onrender.com/v3/hercai?question=" + encodeURIComponent("role: 'system', content: 'You're name is hercai you're helpful chatbot llm version herc-ai-7b' },\n{ role: 'user', content: '" + query + "' }"));
      answer = response.data.reply.replace(/\*\*(.*?)\*\*/g, (_, text) => font.bold(text));
      success = true;
    } catch (error) {
      attempts++;
      if (attempts < maxRetries) {
        await answering.edit(mono(`No response from Hercai AI. Retrying... (${attempts} of ${maxRetries} attempts)`));
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      } else {
         answering.edit(mono("No response from Hercai AI. Please try again later: " + error.message));
        return;
      }
    }
  }

  const codeBlocks = answer.match(/```[\s\S]*?```/g) || [];
  const line = "\n" + '━'.repeat(18) + "\n";
  
  // Replace double asterisks with bold text
  answer = answer.replace(/\*\*(.*?)\*\*/g, (_, text) => font.bold(text));
  
  const message = font.bold("🌙 | HERC-AI") + line + answer + line;

  await answering.edit(message);

  if (codeBlocks.length > 0) {
    const allCode = codeBlocks.map(block => block.replace(/```/g, '').trim()).join('\n\n\n');
    const cacheFolderPath = path.join(__dirname, "cache");

    if (!fs.existsSync(cacheFolderPath)) {
      fs.mkdirSync(cacheFolderPath);
    }

    const uniqueFileName = `code_snippet_${Math.floor(Math.random() * 1e6)}.txt`;
    const filePath = path.join(cacheFolderPath, uniqueFileName);

    fs.writeFileSync(filePath, allCode, 'utf8');

    try {
      const fileStream = fs.createReadStream(filePath);
      await chat.reply({ attachment: fileStream });
    } catch (error) {
      console.error("Failed to send code snippet:", error);
    } finally {
      fs.unlinkSync(filePath);
    }
  }
};
