module.exports = {
    config: {
        name: 'mention',
        info: "Mention host",
        type: "goibot",
    },
    handleEvent: async ({ chat, event }) => {
        // Check if event.body is defined before using it
        const message = event.body ? event.body.split(' ')[0].toLowerCase() : '';

        // Define keywords to detect in messages
        const detected = {
            bot: ["bot", "botbot", "bobot"],
            master: ["@hajime", "@kenneth"],
            lyn: ["@lyn"],
            lyn_update: ["update?"]
        };

        // Define responses for each keyword category
        const responses = {
            bot: ["i'm not bot!", "pinagsasabi mo?", "di ako bot!", "walang bot dito."],
            master: ["tulog pa si master : >", "busy siya", "don't ping staff!", "tulog ata!", "nag bby time pa!", "busy po.."],
            lyn: ["nag deact na gudbye"],
            lyn_update: ["wala pang pera", "wala pa", "next year pa", "wala na daw"]
        };

        // Check for bot mentions
        if (detected.bot.includes(message)) {
            chat.reply(responses.bot[Math.floor(Math.random() * responses.bot.length)], event.threadID, event.messageID);
        }
        // Check for master mentions
        else if (detected.master.some(master => event.body && event.body.toLowerCase().includes(master))) {
            chat.reply(responses.master[Math.floor(Math.random() * responses.master.length)], event.threadID, event.messageID);
        }
        // Check for lyn mentions
        else if (detected.lyn.some(lyn => event.body && event.body.toLowerCase().includes(lyn))) {
            chat.reply(responses.lyn[Math.floor(Math.random() * responses.lyn.length)], event.threadID, event.messageID);
        }
        // Check for lyn update mentions
        else if (detected.lyn_update.some(lyn_update => event.body && event.body.toLowerCase().includes(lyn_update))) {
            chat.reply(responses.lyn_update[Math.floor(Math.random() * responses.lyn_update.length)], event.threadID, event.messageID);
        }
    }
};