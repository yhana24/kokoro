module.exports["config"] = {
    name: "font",
    isPrefix: false,
    aliases: ["fontstyle", "fonts", "fontstyles", "fontsstyle", "fontsstyles"],
    usage: "[style] [text] OR reply to a message containing text",
    info: "Apply font style to text",
    version: "0.8.4"
};

module.exports["run"] = ({ chat, font, event, args }) => {
    let style, text;

    if (event.type === "message_reply" && event.messageReply.body) {
        text = font.origin(event.messageReply.body);
        style = args[0] ? args[0].trim().toLowerCase() : null;
    } else {
        if (args.length === 0) {
            return chat.reply(font.monospace(
                `Please provide a style and text to apply the font, or reply to a message containing the text.\n\nAvailable styles:\n\n- ${font.thin('thin')}\n- ${font.monospace('monospace')}\n- ${font.bold('bold')}\n- ${font.italic('italic')}\n- ${font.underline('underline')}\n- ${font.strike('strike')}\n- ${font.roman('roman')}\n- ${font.bubble('bubble')}\n- ${font.squarebox('squarebox')}\n- ${font.origin('origin')}\n\nUsage: ${module.exports.config.usage}`
            ));
        }

        style = args[0].trim().toLowerCase();
        text = font.origin(args.slice(1).join(" ").trim());
    }

    let styledText;
    switch (style) {
        case 'thin':
            styledText = font.thin(text);
            break;
        case 'monospace':
            styledText = font.monospace(text);
            break;
        case 'bold':
            styledText = font.bold(text);
            break;
        case 'italic':
            styledText = font.italic(text);
            break;
        case 'underline':
            styledText = font.underline(text);
            break;
        case 'strike':
            styledText = font.strike(text);
            break;
        case 'roman':
            styledText = font.roman(text);
            break;
        case 'bubble':
            styledText = font.bubble(text);
            break;
        case 'squarebox':
            styledText = font.squarebox(text);
            break;
        case 'origin':
            styledText = font.origin(text);
            break;
        default:
            return chat.reply(font.monospace(
                `Unsupported style. Please use one of the following:\n\n- ${font.thin('thin')}\n- ${font.monospace('monospace')}\n- ${font.bold('bold')}\n- ${font.italic('italic')}\n- ${font.underline('underline')}\n- ${font.strike('strike')}\n- ${font.roman('roman')}\n- ${font.bubble('bubble')}\n- ${font.squarebox('squarebox')}\n- ${font.origin('origin')}\n\nUsage: ${module.exports.config.usage}`
            ));
    }

    chat.reply(styledText);
};
