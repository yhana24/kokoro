module.exports["config"] = {
  name: "countmember",
  aliases: ["countmem", "totalmem", "totalmember", "totalm", "countm"],
  version: "1.0.0",
  info: "Count the total number of participants in the group",
};

module.exports["run"] = async ({ chat, font, event }) => {
    
    if (!event.isGroup) return chat.reply(font.monospace("You can only use this command in group chats!")); 
    
    const threadInfo = await chat.threadInfo(event.threadID);
    const totalParticipants = threadInfo?.participantIDs.length || event?.participantIDs.length;
    
      if (!totalParticipants) {
          return chat.reply(font.monospace("Bot is tempory block by facebook can't use this feature : <"));
      }

    chat.reply(font.monospace(`Total number of participants in this group: ${totalParticipants}`));
};
