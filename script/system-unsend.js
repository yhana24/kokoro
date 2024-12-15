module.exports["config"] = {
    name: "unsend",
    role: 0,
    isPrefix: false,
    aliases: ['unsent', 'delete', 'remove'],
    usage: '<reply to bot\'s message>',
    guide: 'Reply with "unsend" to a bot message like: "hello, how can I assist you today?"\nResult: Unsend Message!',
    cd: 0,
};

module.exports["run"] = async ({ api, event, chat, font }) => {
    if (event.type !== "message_reply") {
        return chat.reply(font.monospace("Reply to my message to unsend."), event.threadID, event.messageID);
    }

    if (event.messageReply?.senderID !== api.getCurrentUserID()) {
        return chat.reply(font.monospace("I can't unsend messages from other users."), event.threadID, event.messageID);
    }

    api.unsendMessage(event.messageReply.messageID, (err) => {
        if (err) {
            chat.reply(font.monospace("The bot is temporarily blocked by Facebook and can't use this feature :<"), event.threadID, event.messageID);
        }
    });
};