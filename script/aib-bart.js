const axios = require('axios');

module.exports["config"] = {
    name: "bart",
    aliases: ["sum",
        "summary",
        "summarize"],
    version: "1.0.0",
    isPrefix: false,
    role: 1,
    credits: "kennethpanio",
    info: "Summarize text using BART AI",
    type: "utility",
    usage: "[summarize length] [sentence]",
    guide: "reply with a message containing text or provide the text and summary length as arguments",
    cd: 10,
};

module.exports["run"] = async ({
    chat, event, args, font, prefix, global
}) => {
    var {
        url,
        key,
        summarize
    } = global.api.workers;
    const mono = txt => font.monospace(txt);

    let inputText;
    let maxLength = 50;

    if (event.type === "message_reply" && event.messageReply.body) {
        inputText = event.messageReply.body;
        if (args.length > 0 && !isNaN(args[0])) {
            maxLength = parseInt(args[0], 10);
        }
    } else if (args.length > 0) {
        if (!isNaN(args[0])) {
            maxLength = parseInt(args[0], 10);
            inputText = args.slice(1).join(" ");
        } else {
            inputText = args.join(" ");
        }
    } else {
        return chat.reply(mono("Please reply to a message with text or provide the text and summary length as arguments!"));
    }

    if (!inputText) {
        return chat.reply(mono("No valid text found for summarization!"));
    }

    const summarizing = await chat.reply(mono("Summarizing Topic..."));

    const data = {
        input_text: font.origin(inputText),
        max_length: maxLength
    };

    try {
        const response = await axios.post(url + summarize[0], data, {
            headers: {
                "Authorization": `Bearer ${atob(key)}`,
                "Content-Type": "application/json"
            }
        });

        const summary = response.data.result.summary;
         chat.reply(mono(`Summary: ${summary}`));
        
    } catch (error) {
        chat.reply(mono(`Failed to summarize the text: ${error.message}`));
        
    }
};