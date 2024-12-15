

module.exports["config"] = {
  name: "setadmin",
  info: "Promote or demote yourself or provided link or uid who is member of group",
  role: 2,
  version: "1.0.0",
  usage: "[optional: uid/link]",
};

module.exports["run"] = async ({ event, chat, args, font }) => {
    
    if (!event.isGroup) return chat.reply(font.monospace("You can't use this in Private Chat!"));
    
    const threadInfo = await chat.threadInfo(event.threadID);
    const botID = chat.botID();

    if (!threadInfo || !botID) {
      chat.reply(font.monospace("Temporary Block by facebook can't use this feature : <"));
      return;
    }

    if (!threadInfo.adminIDs.some(admin => admin.id === botID)) {
      chat.reply(font.monospace("Bot is not an admin in the group. Can't change admin status."));
      return;
    }

    let targetID;
    const targetInput = args[0];

    const facebookLinkRegex = /(?:https?:\/\/)?(?:www\.)?facebook\.com\/(?:profile\.php\?id=)?(\d+)|@(\d+)|facebook\.com\/([a-zA-Z0-9.]+)/i;
    const isFacebookLink = facebookLinkRegex.test(targetInput);

    if (isFacebookLink) {
      const uid = await chat.uid(targetInput);
      targetID = uid ? uid : event.senderID;
    } else {
      targetID = targetInput ? targetInput : event.senderID;
    }

    if (threadInfo.adminIDs.some(admin => admin.id === targetID)) {
      await chat.demote(targetID);
      chat.reply(font.monospace(`User ${targetID} has been demoted from admin.`));
    } else {
      await chat.promote(targetID);
      chat.reply(font.monospace(`User ${targetID} has been promoted to admin.`));
    }
};
