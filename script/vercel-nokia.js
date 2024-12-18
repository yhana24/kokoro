const axios = require('axios');

module.exports["config"] = {
  name: "nokia",
  role: 0,
  credits: "Cliff",
  description: "blink",
  usages: "mention or reply",
  cooldown: 5,
  aliases: [],
};

module.exports.run = async function({ api, event, args }) {
  try {
    let userID;

    if (args.length === 0) {
      if (event.messageReply) {
        userID = event.messageReply.senderID;
      } else {
        userID = event.senderID;
      }
    } else if (Object.keys(event.mentions).length === 0) {
      userID = args.join(" ");
    } else {
      for (const mentionID in event.mentions) {
        userID = mentionID;
        break;
      }
    }

    const response = `https://api-canvass.vercel.app/nokia?userid=${userID}`;

const responsee = await axios.get(response, { responseType: 'stream' });

    return api.sendMessage({
      attachment: responsee.data
    }, event.threadID);

  } catch (err) {
    return api.sendMessage('Error while processing blink request', event.threadID, event.messageID);
  }
};
