let adminNotificationEnabled = true;

module.exports = {
  config: {
    name: "notification",
    version: "1.0.3",
    credits: "Mirai Team || modded modified by team atomic slash studio",
    info: "Group Information Update",
    usage: "[on/off]",
  },
  handleEvent: async ({ event, chat, font }) => {
    if (!adminNotificationEnabled) return;

    const mono = txt => font.monospace(txt);
    const name = async (uid) => await chat.userName(uid);
    
    const getUserGender = async (uid) => {
      const threadInfo = await chat.threadInfo(event.threadID);
      if (!threadInfo || !threadInfo.userInfo) {
        return null;
      }
      const user = threadInfo.userInfo.find(user => user.id === uid);
      return user ? user.gender.toLowerCase() : null;
    };

    const getGenderedPronoun = async (uid) => {
      const gender = await getUserGender(uid);
      if (gender === 'male') return 'his';
      if (gender === 'female') return 'her';
      return 'their';
    };

    const { author: authorID, logMessageType, logMessageData, logMessageBody } = event;
    
    const replies = {
      "log:thread-admins": async () => {
        const action = logMessageData.ADMIN_EVENT === "add_admin" ? "Promoted" : "Demoted";
        const targetUserId = logMessageData.TARGET_ID;
        chat.reply(mono(`[ GROUP UPDATE ]\n❯ ${await name(authorID)}, ${action} ${await name(targetUserId)} to ${action === "Promoted" ? "Admin" : "Member"}.`));
      },
      "log:thread-name": () => {
        const updatedName = logMessageData.name || null;
        chat.reply(mono(`[ GROUP UPDATE ]\n❯ ${updatedName ? `Updated Group Name to: ${updatedName}` : "Cleared the Group Name"}.`));
      },
      "log:user-nickname": async () => {
        const { participant_id, nickname } = logMessageData;
        if (authorID === chat.botID()) return;
        if (!nickname) {
          chat.reply(mono(`[ GROUP UPDATE ]\n❯ ${await name(authorID)} removed ${await name(participant_id)}'s nickname.`));
        } else {
          const message = participant_id === authorID ?
            `Set ${await getGenderedPronoun(participant_id)} own nickname to > ${nickname}` :
            `Set ${await name(participant_id)}'s nickname to > ${nickname}`;
          chat.reply(mono(`[ GROUP UPDATE ]\n❯ ${await name(authorID)} ${message}`));
        }
      },
      "log:thread-icon": () => chat.reply(mono(`[ GROUP UPDATE ]\n❯ Updated group icon.`)),
      "log:thread-color": () => chat.reply(mono(`[ GROUP UPDATE ]\n❯ Updated group color.`)),
      "log:link-status": () => chat.reply(logMessageBody),
      "log:magic-words": () => {
        chat.reply(mono(`[ GROUP UPDATE ]\n❯ Theme ${logMessageData.magic_word} added effect: ${logMessageData.theme_name}\n❯ Emoji: ${logMessageData.emoji_effect || "No emoji"}\n❯ Total ${logMessageData.new_magic_word_count} word effect added`));
      },
      "log:thread-approval-mode": () => chat.reply(mono(logMessageBody)),
      "log:thread-poll": () => chat.reply(mono(logMessageBody))
    };

    if (replies[logMessageType]) await replies[logMessageType]();
  },

  run: async ({ args, chat, font }) => {
    const mono = txt => font.monospace(txt);
    const command = args[0];

    if (!command || !["on", "off"].includes(command)) {
      chat.reply(mono("Invalid command. Use 'on' to enable notifications or 'off' to disable them."));
      return;
    }

    adminNotificationEnabled = command === "on";
    chat.reply(mono(`Thread Notifications are now ${adminNotificationEnabled ? "enabled" : "disabled"}.`));
  }
};