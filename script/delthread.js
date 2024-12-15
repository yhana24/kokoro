module.exports = {
    config: {
        name: "clearchat",
        role: 0,
        aliases: ["delthread", "clearpm", "pmclear", "clearpm", "chatdel", "delchat", "chatclear"],
        info: "Deletes the bot's private message history (useful if you do not want the bot owner to view your message).",
        isPrefix: false,
        cd: 6
    },
    async run({ chat, box, font, event }) {
        
        const monospace = text => font.monospace(text);

        if (event.isGroup) {
            return box.reply(monospace("This command can only be used in private chat."));
        }

        const clearingMessage = await box.reply(monospace('Clearing chat history...'));
        await box.reply(monospace('Private chat history deleted.'));
        chat.delthread(event.threadID);
        clearingMessage.unsend();
    }
};