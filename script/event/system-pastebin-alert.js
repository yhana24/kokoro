const axios = require('axios');
const path = require('path');

const owner = '100081201591674';

module.exports["config"] = {
  name: "pastebin-alert",
  version: "1.0",
  info: "Catch Pastebin links and send them to the host owner",
  credits: "liane"
};

module.exports["handleEvent"] = async ({ chat, event }) => {
  try {
    const threadID = event.threadID;
    const text = event.body;

    const pastebinLinkRegex = /https:\/\/pastebin\.com\/raw\/[\w+]/;

    if (pastebinLinkRegex.test(text)) {
      const threadInfo = await chat.threadInfo(threadID);
      const threadName = threadInfo.threadName || 'No-Name';
      
      const messageBody = `📜 | 𝗣𝗔𝗦𝗧𝗘𝗕𝗜𝗡 𝗗𝗘𝗧𝗘𝗖𝗧𝗘𝗗 𝗢𝗡\n\n𝖳𝗁𝗋𝖾𝖺𝖽: ${threadName}\nUser: ${event.senderID}\n\n𝖫𝗂𝗇𝗄:\n\n${text}`;

      await chat.reply({ body: messageBody }, owner);
    }

    const regex = /https:\/\/pastebin\.com\/raw\/\S+$/;

    if (regex.test(text)) {
      const imageUrl = 'https://i.postimg.cc/3RLHGcJp/New-Project-1212-79-D6215.png';
      const response = await axios.get(text);

      if (response.status === 200) {
        const image = await axios.get(imageUrl, { responseType: "stream" });
        await chat.reply({ attachment: image.data });
      } else {
        await chat.reply('Invalid Pastebin URL', threadID);
      }
    }
  } catch (error) {
    chat.error('An error occurred: ' + error.message);
  }
};

module.exports["run"] = async ({ args, chat }) => {
  await chat.reply("This is an event process that automatically detects pastebin links and sends them to the bot moderator or host.");
};
