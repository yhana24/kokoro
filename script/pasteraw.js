const axios = require("axios");

module.exports["config"] = {
        name: "pasteraw",
        role: 0,
        credits: "AkhiroDEV", // modified by Kenneth Panio
        info: "detect and get the code through the pastebin",
        cd: 5
};

module.exports["handleEvent"] = async ({ chat, args, event }) => {
        const message = event.body?.split(' ')[0];

        if (!/^https:\/\/pastebin\.com\/[a-zA-Z0-9]{8}$/.test(message) && !/^https:\/\/pastebin\.com\/raw\/[a-zA-Z0-9]{8}$/.test(message)) {
                // Do nothing if the URL is invalid
                return;
        }

        // Convert to raw URL if it's not already
        const rawUrl = message.replace(/^https:\/\/pastebin\.com\/([a-zA-Z0-9]{8})$/, 'https://pastebin.com/raw/$1');

        try {
                const { data } = await axios.get(rawUrl);
                const modifiedData = data.replace(/\bmodule\.exports\.(run|config|handleEvent|handleReply)\b/g, 'module.exports["$1"]');

                chat.reply(modifiedData);
        } catch (error) {
                chat.reply(`ERROR: ${error.message}`);
                console.error(`ERROR: ${error.message}`);
        }
};