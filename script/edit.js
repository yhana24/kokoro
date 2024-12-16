module.exports["config"] = {
  name: "edit",
  version: "1.0",
  role: 0,
  credits: 'Yan Maglinte',
  info: 'Edit Bots messages!',
  type: 'message',
  usage: 'reply to a message then type edit <your_message>',
  cd: 5,
};

module.exports["run"] = async function({ api, event, args }) {
  let reply, edit;

  if (event.type === "message_reply") {
    reply = event.messageReply.body;
    edit = args.join(" ");
  } else {
    api.sendMessage("Invalid input. Please reply to a bot message to edit.\n\nusage: edit [text]", event.threadID, event.messageID);
    return;
  }

  if (!reply || args.length === 0) {
    api.sendMessage("Invalid input. Please reply to a bot message to edit.\n\nusage: edit [text]", event.threadID, event.messageID);
    return;
  }

  try {
    await api.editMessage(edit, event.messageReply.messageID);
    api.setMessageReaction('✅', event.messageID, () => {}, true);
  } catch (error) {
    console.error("Error editing message", error);
    api.sendMessage("An error occurred while editing the message. Please try again later.", event.threadID);
  }
};