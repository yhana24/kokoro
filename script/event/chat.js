const fs = require('fs');
const path = require('path');

module.exports["config"] = {
  name: "chat",
  role: 2,
  version: "1.0.0",
  credits: "Jonell Magallanes // bug: when bot restart chat off will no longer active. fixed by Kenneth Panio🛠️",
  info: "Remove user from the group if chat off",
  type: "kick_member",
  usage: "[on/off]",
};

let chatStore = {};

// Load chat settings from file when the bot starts up
const filePath = path.join(__dirname, 'system', 'chatStore.json');
if (fs.existsSync(filePath)) {
  const data = fs.readFileSync(filePath, 'utf-8');
  chatStore = JSON.parse(data);
}

module.exports["handleEvent"] = async ({ chat, event }) => {
    
  if (!event.isGroup) return;
  
  const threadID = event.threadID;
  if (!chatStore[threadID]) return;

  const botID = chat.botID();
  if (event.senderID === botID) return;

  const threadInfo = await chat.threadInfo(threadID);
  const isBotAdmin = threadInfo.adminIDs.some(adminInfo => adminInfo.id === botID);

  if (!isBotAdmin) {
    return;
  }

  chat.kick(event.senderID);
  chat.reply(`${await getUserName(chat, event.senderID)} has been removed from the group due to chat off being activated by the group administrator.`);
  return;
};

module.exports["run"] = async ({ chat, event, args }) => {
    if (!event.isGroup) {
        return chat.reply("You can only use this feature in Group Chats");
    }
    
  const threadID = event.threadID;
  if (args.length === 0) {
     chat.reply(`🛡️ | Chat off is currently ${chatStore[threadID] ? 'activated' : 'deactivated'} for this thread. Use "chat on" or "chat off" to toggle it.`);
     return;
  }

  const option = args[0]?.toLowerCase();
  if (option !== "on" && option !== "off") {
     chat.reply('🛡️ | Use "chat on" to enable or "chat off" to disable chat.');
     return;
  }

  const botID = chat.botID();
  const threadInfo = await chat.threadInfo(threadID);
  const isAdmin = threadInfo.adminIDs.some(adminInfo => adminInfo.id === event.senderID);
  const isBotAdmin = threadInfo.adminIDs.some(adminInfo => adminInfo.id === botID);

  if (!isBotAdmin) {
     chat.reply('🛡️ | the bot need to be administrators to toggle chat off.');
     return;
  }

  chatStore[threadID] = option === "off";

  // Save chat settings
  fs.writeFileSync(filePath, JSON.stringify(chatStore), 'utf-8');

  // Inform the user about the status change
  return chat.reply(`🛡️ | Chat off has been ${option === "off" ? "activated" : "deactivated"} for this thread.`);
};

async function getUserName(chat, senderID) {
  try {
    const userInfo = await chat.userInfo(senderID);
    return userInfo[senderID]?.name || "User";
  } catch (error) {
    chat.log(error);
    return "User";
  }
}
