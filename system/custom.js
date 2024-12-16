const cron = require('node-cron');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = ({ api, font, chat }) => {
    const mono = txt => font.monospace ? font.monospace(txt) : txt;

    const configPath = path.resolve(__dirname, '../kokoro.json');
    let config;
    try {
        config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch (error) {
        console.error("Error reading config file:", error);
        return;
    }

    const timezone = config.timezone || "UTC";

    const greetings = {
        morning: ["Good morning! Have a great day!", "Rise and shine! Good morning!"],
        afternoon: ["Good afternoon! Keep up the great work!", "Time to eat something!"],
        evening: ["Good evening! Relax and enjoy your evening!", "Evening! Hope you had a productive day!"],
        night: ["Good night! Rest well!", "Tulog na kayo!"]
    };

    function greetRandom(timeOfDay) {
        const greetingsList = greetings[timeOfDay] || [];
        return greetingsList[Math.floor(Math.random() * greetingsList.length)];
    }

    async function greetThreads(timeOfDay) {
        try {
            const msgTxt = greetRandom(timeOfDay);
            const threads = await api.getThreadList(5, null, ['INBOX']);
            for (const thread of threads) {
                if (thread.isGroup) {
                    await api.sendMessage(mono(msgTxt), thread.threadID).catch();
                }
            }
        } catch (error) {
            console.error(`Error in ${timeOfDay} greetings:`, error);
        }
    }

    async function restart() {
        chat.log("Restarting...");
        process.exit(0);
    }

    async function clearChat() {
        try {
            chat.log("Clearing chat...");
            const threads = await api.getThreadList(25, null, ['INBOX']);
            for (const thread of threads) {
                if (!thread.isGroup) {
                    await api.deleteThread(thread.threadID).catch();
                }
            }
        } catch (error) {
            console.error("Error clearing chat:", error);
        }
    }

    async function acceptPending() {
        try {
            chat.log("Accepting pending messages...");
            const pendingThreads = await api.getThreadList(25, null, ['PENDING']);
            for (const thread of pendingThreads) {
                await api.sendMessage(mono('📨 Automatically approved by our system.'), thread.threadID).catch();
            }
        } catch (error) {
            console.error("Error accepting pending messages:", error);
        }
    }

    async function motivation() {
        try {
            chat.log("Posting motivational quotes...");
            const response = await axios.get("https://raw.githubusercontent.com/JamesFT/Database-Quotes-JSON/master/quotes.json");
            const quotes = response.data;
            if (!Array.isArray(quotes) || quotes.length === 0) {
                throw new Error("Invalid quotes data received.");
            }
            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
            const quote = `"${randomQuote.quoteText}"\n\n— ${randomQuote.quoteAuthor || "Anonymous"}`;
            await api.createPost(mono(quote)).catch();
        } catch (error) {
            console.error("Error posting motivational quote:", error);
        }
    }

    const scheduleGreetings = (timeOfDay, hours) => {
        hours.forEach(hour => {
            cron.schedule(`0 ${hour} * * *`, () => greetThreads(timeOfDay), { timezone });
        });
    };

    Object.entries(config.cronJobs).forEach(([key, job]) => {
        if (!job.enabled) return;

        if (key.endsWith('Greetings')) {
            const timeOfDay = key.replace('Greetings', '').toLowerCase();
            scheduleGreetings(timeOfDay, job.hours || []);
        } else {
            const taskMap = { restart, clearChat, acceptPending, motivation };
            const task = taskMap[key];
            if (task) {
                cron.schedule(job.cronExpression, task, { timezone });
            }
        }
    });
};
