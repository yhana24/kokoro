const axios = require('axios');

module.exports["config"] = {
  name: "conv2cookie",
  aliases: ["c2c"],
  info: "This command converts appstate JSON to cookie format",
  type: "tools",
  usage: "convert2cookie [appstate json] or reply to a message containing appstate JSON",
  isPrefix: true,
  version: "1.0.0",
  role: 0,
};

module.exports["run"] = async ({ api, chat, event, args, font, global }) => {
  const tin = txt => font.monospace(txt);
  let jsonInput;

  if (event.type === "message_reply" && event.messageReply.body) {
    jsonInput = event.messageReply.body; 
  } else if (args.length > 0) {
    jsonInput = args.join(" ");
  } else {
    chat.reply(tin('Please provide an appstate JSON either as an argument or by replying to a message containing appstate JSON.'), event.threadID, event.messageID);
    return;
  }

  try {
    const jsonArray = JSON.parse(jsonInput); 
    if (Array.isArray(jsonArray)) {
      const cookieString = jsonArray.map(item => `${item.key}=${item.value}`).join("; ");
      
      chat.reply(cookieString, event.threadID, event.messageID);
    } else {
      chat.reply(tin("Provided input is not a valid JSON array."), event.threadID, event.messageID);
    }
  } catch (error) {
    chat.reply(tin(`Error parsing JSON: ${error.message}`), event.threadID, event.messageID);
  }
};