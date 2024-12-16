const axios = require("axios");
const devs = require(__dirname.replace("/script", "") + '/system/api');

let simSimiEnabled = false;

module.exports["config"] = {
    name: "simv2",
    version: "1.2.1",
    role: 3,
    credits: "Mark Hitsuraan ",
    info: "Toggle SimSimi auto-reply",
    usages: ["on", "off"],
    cd: 2
};

module.exports["handleEvent"] = async function({ chat, api, event }) {
    if (simSimiEnabled && event.type === "message" && event.senderID !== api.getCurrentUserID()) {
        const content = encodeURIComponent(event.body);

        try {
            const res = await axios.get(`${devs.markdevs69}/sim?q=${content}`);
            const respond = res.data.response;

            if (res.data.error) {
                chat.reply(`Error: ${res.data.error}`, event.threadID);
            } else {
                chat.reply(respond, event.threadID);
            }
        } catch (error) {
            console.error(error);
            chat.reply("An error occurred while fetching the data.", event.threadID);
        }
    }
};

module.exports["run"] = async function({ chat, api, event, args }) {
    const { threadID, messageID } = event;
    const action = args[0]?.toLowerCase();

    if (action === "on") {
        simSimiEnabled = true;
        return chat.reply("simv2 auto-reply is now ON.", threadID, messageID);
    } else if (action === "off") {
        simSimiEnabled = false;
        return chat.reply("simv2 auto-reply is now OFF.", threadID, messageID);
    } else {
        if (!simSimiEnabled) {
            return chat.reply("simv2 auto-reply is currently OFF. Use 'simv2 on' to enable.", threadID, messageID);
        }

        chat.reply("Invalid command. You can only use 'simv2 on' or 'simv2 off'.", threadID, messageID);
    }
};