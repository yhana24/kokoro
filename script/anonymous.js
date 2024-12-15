const fs = require('fs');
const path = require('path');

module.exports["config"] = {
  name: "amsg",
  version: "1.0.0",
  role: 0,
  aliases: ['anonymousmsg'],
  info: 'Send an anonymous message to a user.',
  usage: '[link or uid] [some messages]',
  credits: 'Kenneth Panio',
};

module.exports["run"] = async ({ event, args, chat, font }) => {
  const { senderID } = event;
  const target = args[0];
  const message = args.slice(1).join(' ');

  if (!target || !message) {
    return chat.reply(font.italic('❗ | Please provide a target (link or UID) and a message.'));
  }

  try {
    // Validate target (link or UID)
    const facebookLinkRegex = /(?:https?:\/\/)?(?:www\.)?facebook\.com\/(?:profile\.php\?id=)?(\d+)|@(\d+)|facebook\.com\/([a-zA-Z0-9.]+)/i;
    let targetUID;

    if (facebookLinkRegex.test(target)) {
      targetUID = await chat.uid(target);
      if (!targetUID) {
        return chat.reply(font.italic("❗ | Unable to retrieve UID from the provided Facebook link."));
      }
    } else {
      targetUID = target;
    }


    const anonymizedSenderID = senderID.slice(0, -6) + '******';

    const cacheFolderPath = path.join(__dirname, "cache");

    if (!fs.existsSync(cacheFolderPath)) {
      fs.mkdirSync(cacheFolderPath);
    }

    const numeric = Math.floor(Math.random() * 10000);
    const fileName = `Anonymous_Message_${numeric}.txt`;
    const filePath = path.join(cacheFolderPath, fileName);
    fs.writeFileSync(filePath, message, 'utf-8');

    const fileStream = fs.createReadStream(filePath);

    await chat.reply({ 
      body: "You have received an anonymous message from: " + anonymizedSenderID + ". Download the attachment to see the message.",
      attachment: fileStream 
    }, targetUID);

    fileStream.close();
    fs.unlinkSync(filePath);

    chat.reply(font.italic("✅ | Anonymous message sent successfully."));
  } catch (error) {
    chat.reply(font.italic(`${error.message || `Can't send attachment bot is temporary restricted from using this feature.`}`));
  }
};
