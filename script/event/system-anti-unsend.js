const axios = require('axios');
const fs = require("fs");

module.exports = {
    config: {
        name: "resend",
        info: 'Catches and resends unsent messages',
        version: "1.0.0",
        usage: '[on/off]',
    },
    handleEvent: async ({
        api, event, chat, font
    }) => {
        const filePath = './data/history.json';
        const data = fs.readFileSync(filePath, 'utf8');
        const history = JSON.parse(data);

        const isInHistory = history.some(entry => entry.userid === event.senderID);

        const isBot = event.senderID === await chat.botID();

        if (isInHistory || isBot) {
            return;
        }

        const mono = txt => font.monospace(txt);

        if (event.type === 'message') {
            msgData[event.messageID] = {
                body: event.body,
                attachments: event.attachments
            };
        }

        if (event.type === "message_unsend" && msgData[event.messageID] && resendEnabled) {
            try {
                const userInfo = await api.getUserInfo(event.senderID);
                const {
                    name
                } = userInfo[event.senderID];
                const {
                    body,
                    attachments
                } = msgData[event.messageID];


                const reply = async (type, url) => {
                    chat.reply({
                        body: mono(`${name} unsent this ${type}: ${body}`),
                        attachment: await chat.stream(url)
                    });
                };


                if (!attachments || attachments.length === 0) {
                    return chat.reply(mono(`${name} unsent this message: ${body}`));
                }


                const {
                    type,
                    url,
                    previewUrl
                } = attachments[0];
                const urls = attachments.map(a => a.url);


                if (type === 'photo') {
                    await reply('photo', urls);
                } else if (type === 'audio') {
                    await reply('voice message', url);
                } else if (type === 'video') {
                    await reply('video message', url);
                } else if (type === 'animated_image') {
                    await reply('gif', previewUrl);
                }

            } catch (error) {
                console.error(error.message);
            }
        }
    },
    run: async ({
        args, chat, font
    }) => {
        const mono = txt => font.monospace(txt);
        const command = args[0]?.toLowerCase();

        resendEnabled = command === "on";
        chat.reply(mono(`Resend functionality is now ${resendEnabled ? "enabled": "disabled"}`));
    },
};

let msgData = {};
let resendEnabled = false;