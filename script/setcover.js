const axios = require('axios');

module.exports["config"] = {
  name: "setcover",
  aliases: ["cover", "coverphoto", "setcoverphoto"],
  version: "1.0.0",
  role: 1,
  credits: "kennethpanio",
  info: "Change your cover photo",
  type: "utility",
  usage: "[reply with attachment or provide URL in args]",
  guide: "reply with an image attachment or provide the image URL as an argument",
  cd: 10,
};

module.exports["run"] = async ({ chat, event, args, font, prefix}) => {
  var mono = txt => font.monospace(txt);

  if (event.type !== "message_reply" && args.length === 0) {
    return chat.reply(mono("Please reply to an image or provide an image URL in the arguments!"));
  }

  let imageUrl;
  
  if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments.length > 0) {
    imageUrl = event.messageReply.attachments[0].url;
  } else if (args.length > 0) {
    imageUrl = args[0];
  }

  if (!imageUrl) {
    return chat.reply(mono("No valid image URL found!"));
  }

  try {
    await chat.cover(imageUrl);
    chat.reply(mono("Cover photo updated successfully!"));
  } catch (error) {
    chat.reply(mono("Failed to update cover photo. Please try again later."));
  }
};
