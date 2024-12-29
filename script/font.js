module.exports["config"] = {
    name: "font",
    isPrefix: false,
    aliases: ["fontstyle", "fonts", "fontstyles", "fontsstyle", "fontsstyles"],
    usage: "[style] [text] OR reply to a message containing text",
    info: "Apply font style to text",
    version: "0.8.4",
};

module.exports["run"] = ({ chat, font, event, args }) => {
    let style, text;

    if (event.type === "message_reply" && event.messageReply.body) {
        text = font.origin(event.messageReply.body.trim());
        style = args[0]?.trim().toLowerCase();
    } else {
        if (args.length < 2) {
            return chat.reply(font.thin(
                `Please provide a style and text to apply the font, or reply to a message containing the text.\n\nAvailable styles:\n\n` +
                `- ${font.thin('thin')}\n- ${font.monospace('monospace')}\n- ${font.bold('bold')}\n- ${font.italic('italic')}\n- ${font.underline('underline')}\n` +
                `- ${font.strike('strike')}\n- ${font.roman('roman')}\n- ${font.bubble('bubble')}\n- ${font.squarebox('squarebox')}\n- ${font.origin('origin')}\n\n` +
                `Usage: ${module.exports.config.usage}`
            ));
        }

        style = args[0].trim().toLowerCase();
        text = font.origin(args.slice(1).join(" ").trim());
    }

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

    if (!availableStyles[style]) {
        return chat.reply(font.monospace(
            `Unsupported style. Please use one of the following:\n\n` +
            `- ${font.thin('thin')}\n- ${font.monospace('monospace')}\n- ${font.bold('bold')}\n- ${font.italic('italic')}\n- ${font.underline('underline')}\n` +
            `- ${font.strike('strike')}\n- ${font.roman('roman')}\n- ${font.bubble('bubble')}\n- ${font.squarebox('squarebox')}\n- ${font.origin('origin')}\n\n` +
            `Usage: ${module.exports.config.usage}`
        ));
    }

    const styledText = availableStyles[style](text);
    chat.reply(styledText);
};
