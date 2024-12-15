module.exports["config"] = {
  name: "idst",
  version: "1.0.0",
  isPrefix: false,
  role: 0,
  credits: "Sam & Yan Maglinte", // Fix the issue that causes an error when it replies to a certain message. - Yan
  info: "Shows the ID information and description of a sticker",
  type: "message",
  usage: "[sticker id] or <reply to sticker>",
}

module.exports["run"] = async ({ chat, event, args, font }) => {
  var mono = txt => font.monospace(txt);
  if (event.type == "message_reply") {
    if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments[0] && event.messageReply.attachments[0].type == "sticker") {
      return chat.reply(mono(`ID: `) + `${event.messageReply.attachments[0].ID}\n` + mono(`Caption: ${event.messageReply.attachments[0].description}`));
    }
    else return chat.reply(mono("Please provide valid sticker id! or 'reply' to sticker!"));
  }
  else if (args[0]) {
    return chat.reply({ sticker: args[0] });
  }
  else return chat.reply(mono("Please provide valid sticker id! or 'reply' to sticker!"));
}
