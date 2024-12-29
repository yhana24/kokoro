module.exports["config"] = {
    name: "font",
    isPrefix: false,
    aliases: ["fontstyle", "fonts", "fontstyles", "fontsstyle", "fontsstyles"],
    usage: "[style] [text] OR reply to a message containing text",
    info: "Apply font style to text",
    version: "0.8.4",
};

module.exports["run"] = ({ chat, font, event, args }) => {
    const availableStyles = {
        thin: font.thin,
        monospace: font.monospace,
        bold: font.bold,
        italic: font.italic,
        underline: font.underline,
        strike: font.strike,
        roman: font.roman,
        bubble: font.bubble,
        squarebox: font.squarebox,
        origin: font.origin,
    };

    const helpMessage = `Please provide a style and text to apply the font, or reply to a message containing the text.\n\nAvailable styles:\n\n${Object.keys(availableStyles)
        .map((style) => `- ${availableStyles[style](style)}`)
        .join("\n")}\n\nUsage: ${module.exports.config.usage}`;

    const replyText = event.messageReply?.body?.trim();
    const style = args[0]?.trim().toLowerCase();
    const text = replyText || font.origin(args.slice(1).join(" ").trim());

    if (!args.length && !replyText) return chat.reply(font.thin(helpMessage));
    if (!availableStyles[style]) return chat.reply(font.monospace(helpMessage));

    chat.reply(availableStyles[style](text));
};
