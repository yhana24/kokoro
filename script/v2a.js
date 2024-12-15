
const path = require('path');

module.exports["config"] = {
    name: "v2a",
    aliases: ["convert2mp3", "convert2audio", "conv2mp3", "conv2a", "convertmp3", "convertaudio"],
    version: "1.0.",
    role: 0,
    credits: "Kenneth Panio",
    info: "video to audio",
    type: "tools",
    usage: "[reply to a video or provide video url]",
    isPrefix: false,
    cd: 5,
};

module.exports["run"] = async ({ chat, event, args, font }) => {
    var mono = txt => font.monospace(txt);
    const { threadID, messageID } = event;
    let url = args[0];

    const urlPattern = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,6}(\/[^\s]*)?$/i;

    if (event.type == "message_reply") {
        url = event.messageReply.attachments[0].url;
    } else if (!url || !urlPattern.test(url)) {
        return chat.reply(mono("Please provide a valid video URL or reply to a video attachment to convert it into mp3 audio."));
    }

    try {
        chat.reply({ attachment: await chat.arraybuffer(url, "mp3") });
    } catch (e) {
         chat.reply(mono(e.message));
    }
};

