
const sagiri = require('sagiri');
const axios = require('axios');

module.exports["config"] = {
    name: "saucenao",
    aliases: ["sauce", "salsa", "sabaw", "source", "sagiri"],
    version: "1.0.2",
    isPrefix: false,
    role: 0,
    credits: "kennethpanio",
    info: "I find Sauce For you!",
    type: "",
    usage: "[reply sauce to the picture]",
    guide: "reply 'sauce' to the picture",
    cd: 10,
};

module.exports["run"] = async ({ chat, event, font, global }) => {
    const { line } = global.design;
    const mono = txt => font.monospace(txt);
    const search = sagiri("74acd50c6675726ccd11ae08b46307abccc0fdb1");

    // Check if the event is a reply to a message
    if (event.type !== "message_reply") {
        return chat.reply(mono("Please reply to the anime picture that you want to find!"));
    }

    // Check if the replied message has attachments
    if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments.length > 0) {
        const attachments = event.messageReply.attachments;

        try {
            // Fetch results for each attachment
            const results = await Promise.all(attachments.map(async attachment => {
                const response = await search(attachment.url);
                return response[0]; // Assuming the first result is the most relevant
            }));

            let replyMessage = "";
            const minSimilarity = 50; // Minimum similarity threshold
            const thumbAttachments = [];

            results.forEach((result, index) => {
                if (result.similarity >= minSimilarity) {
                    replyMessage += `${line}\nSimilarity: ${result.similarity} %\nSite: ${result.site}\nURL: ${result.url}\nAuthor: ${result.authorName || "Unknown"} ${result.authorUrl ? `(${result.authorUrl})` : ""}\nMaterial: ${result.raw.data.material || "Unknown"}\nCharacters: ${result.raw.data.characters || "Unknown"}\nSource: ${result.raw.data.source || "Unknown"}\n${line}`;
                } else {
                    replyMessage += `${line}\nNo result match to this picture\n${line}\n`;
                }

                // Fetch thumbnail for each result
                if (result.thumbnail) {
                    thumbAttachments.push(axios.get(result.thumbnail, { responseType: "stream" }));
                }
            });

            // Wait for all thumbnail requests to complete
            const thumbResponses = await Promise.all(thumbAttachments);
            const thumbStreams = thumbResponses.map(response => response.data);

            // Send the reply message and the thumbnail attachments
            await chat.reply(replyMessage);
            await chat.reply({ attachment: thumbStreams });

        } catch (error) {
             chat.reply(mono("An error occurred while processing your request. Please try again later. " + error.message));
        }
    } else {
         chat.reply(mono("No attachments found in the replied message."));
    }
};
