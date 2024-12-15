const fs = require('fs');
let antiAdminEnabled = true; 

module.exports.config = {
  name: "anti-admin",
  aliases: ["antiadmin"],
  role: 2,
  version: "1.0.0",
  usage: "[on/off]",
};

const filePath = './data/history.json';

module.exports["handleEvent"] = async ({ event, chat }) => {
  if (!antiAdminEnabled || !event.logMessageData || event.logMessageData.ADMIN_EVENT !== "remove_admin") {
    return;
  }

  const threadInfo = await chat.threadInfo(event.threadID);
  
    if (!threadInfo) {
        return console.log("Bot is tempory block by facebook can't use this feature : <");
    }
    
  const botID = chat.botID();
  const authorID = event.author;
  
  const bots = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const botIDs = bots.map(bot => bot.userid);

  if (botIDs.includes(authorID) || authorID === botID) {
    return;
  }

  if (!threadInfo.adminIDs.some(admin => admin.id === botID)) {
    return;
  }

  const targetID = event.logMessageData.TARGET_ID;

  if (threadInfo.participantIDs?.includes(targetID) && !threadInfo.adminIDs.some(admin => admin.id === targetID)) {
    await chat.promote(targetID);
    await chat.demote(authorID);
    chat.log("User has been re-added as admin.");
  }
};

module.exports["run"] = async ({ args, chat }) => {
  const command = args.join(" ").trim().toLowerCase();
  if (command === "off") {
    antiAdminEnabled = false;
    chat.reply("Anti-admin mode disabled.");
  } else if (command === "on") {
    antiAdminEnabled = true;
    chat.reply("Anti-admin mode enabled.");
  } else {
    chat.reply(`Usage: ${module.exports.config.usage}`);
  }
};
