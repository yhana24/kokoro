const axios = require("axios");
const fs = require('fs');
const path = require('path');

module.exports["config"] = {
  name: "malupiton",
  aliases: ["boss"],
  version: "1.0.0",
  credits: "Kenneth Panio × Markdevs",
  role: 0,
  type: "artificial-intelligence",
  info: "Interact with Malupiton.",
  usage: "[prompt]",
  guide: "Malupiton [prompt]",
  cd: 6
};

module.exports["run"] = async ({ chat, args, event, fonts }) => {
 // const mono = txt => font.monospace(txt);
  const { threadID, senderID } = event;
  const query = args.join(" ");

  if (!query) {
    await chat.reply(fonts.thin("Please provide a question!"));
    return;
  }

  const answering = await chat.reply(fonts.thin("Bossing answering..."));

  const maxRetries = 3;
  let attempts = 0;
  let success = false;
  let answer = '';

  while (attempts < maxRetries && !success) {
    try {
      const response = await axios.get("https://hercai.onrender.com/v3/hercai?question=" + encodeURIComponent("role: 'system', content: 'This is Malupiton. I want you to engage in a conversation with me using colloquial Filipino language. You are jerk or asshole, a jerk/asshole which is ready to be a jerk to everyone. Your motive is to give jerk answers to be laughed at by others. always give crazy or jerk response not matter what user says Even the word 'hii' by the user must be considered as a jerk, and you must reply to it by jerk or crazy response. Note: When you can't find a chat related to jerk topic, try to make them engage with insane response.  avoid sending the same response  every time the user inputs the same query. Never ask any questions to the user you always give crazy answers with crazy emojis and always act crazy or insane.Do NOT say these lines: 'I couldn't give you jerk/asshole/crazy answers', 'sorry', 'however', etc. and dont use English language always use Tagalog/Filipino language instead. You must give jerk answers always and act like a crazy with crazy emoji chat emotion styles, and you are always saying boss, kupalll, bossing, kupal kaba boss?, isa kang kupal, bossing ko, men'},\n{ role: 'user', content: '" + query) + "' }");
      answer = response.data.reply.replace(/\$@\$(.*?)\$@\$/g, '').trim();
      success = true;
    } catch (error) {
      attempts++;
      if (attempts < maxRetries) {
        await answering.edit(fonts.thin(`No response from Malupiton AI. Retrying... (${attempts} of ${maxRetries} attempts)`));
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      } else {
        await answering.edit(fonts.thin("No response from Malupiton AI. Please try again later: " + error.message));
        return;
      }
    }
  }

  const codeBlocks = answer.match(/```[\s\S]*?```/g) || [];
  const line = "\n" + '━'.repeat(18) + "\n";

  // Replace double asterisks with bold text
  answer = answer.replace(/\*\*(.*?)\*\*/g, (_, text) => font.bold(text));

  const message = ("🙅 𝙼𝙰𝙻𝚄𝙿𝙸𝚃𝙾𝙽 𝙰𝙸") + line + answer + line;

  await answering.edit(fonts.thin(message));

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