module.exports["config"] = {
    name: "spam",
    info: "Troll and spam group chats",
    usage: "[input]",
    role: 1,
    isPrefix: true,
    guide: "spam 🤖",
    type: "troll",
};

module.exports["run"] = async ({ chat, args, event, font, prefix }) => {
    const mono = txt => font.monospace(txt);
    const input = args.join(" ").trim();

    if (!input) {
        return chat.reply(mono(`Please provide the message and number of messages to spam. example ${prefix}spam nigga! - 100`));
    }

    const separate = input.split('-')[0].trim();
    const count = parseInt(input.split('-')[1]) || 10;

    if (isNaN(count) || count <= 0) {
        return chat.reply(mono("Please provide a valid number of messages to send."));
    }

    if (!event.isGroup) {
        return chat.reply(mono("You can't spam in private chat! Only in group chats."));
    }

    const maxCount = 100; 
    if (count > maxCount) {
        return chat.reply(mono(`You can only spam up to ${maxCount} messages at a time.`));
    }

    for (let i = 0; i < count; i++) {
        await chat.reply(mono(separate));
    }
};