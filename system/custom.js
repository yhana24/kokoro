const cron = require('node-cron');
const axios = require('axios');
const fs = require('fs');

module.exports = ({ api, font }) => {
    const mono = txt => font.monospace(txt);

    const config = JSON.parse(fs.readFileSync('../kokoro.json', 'utf-8'));
    const timezone = config.timezone;

    const greetings = {
        morning: ["Good morning! Have a great day!", "Rise and shine! Good morning!"],
        afternoon: ["Good afternoon! Keep up the great work!", "Time to eat something!"],
        evening: ["Good evening! Relax and enjoy your evening!", "Evening! Hope you had a productive day!"],
        night: ["Good night! Rest well!", "Tulog na kayo!"]
    };

    function greetRandom(timeOfDay) {
        const greetingsList = greetings[timeOfDay];
        return greetingsList[Math.floor(Math.random() * greetingsList.length)];
    }

    async function greetThreads(timeOfDay) {
        try {
            const msgTxt = greetRandom(timeOfDay);
            const threads = await api.getThreadList(5, null, ['INBOX']);
            for (const thread of threads) {
                if (thread.isGroup) {
                    await api.sendMessage(mono(msgTxt), thread.threadID);
                }
            }
        } catch (error) {
            console.error(`Error in ${timeOfDay} greetings:`, error);
        }
    }

    async function restart() {
        console.log("Restarting...");
        process.exit(0);
    }

    async function clearChat() {
        console.log("Clearing chat...");
        const threads = await api.getThreadList(25, null, ['INBOX']);
        for (const thread of threads) {
            if (!thread.isGroup) await api.deleteThread(thread.threadID);
        }
    }

    async function acceptPending() {
        console.log("Accepting pending messages...");
        const pendingThreads = await api.getThreadList(25, null, ['PENDING']);
        for (const thread of pendingThreads) {
            await api.sendMessage(mono('📨 Automatically approved by our system.'), thread.threadID);
        }
    }

    async function motivation() {
        console.log("Posting motivational quotes...");
        const response = await axios.get("https://raw.githubusercontent.com/JamesFT/Database-Quotes-JSON/master/quotes.json");
        const quotes = response.data;
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        const quote = `"${randomQuote.quoteText}"\n\n— ${randomQuote.quoteAuthor || "Anonymous"}`;
        api.createPost(mono(quote)).catch(console.error);
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
            scheduleGreetings(timeOfDay, job.hours);
        } else {
            const taskMap = { restart, clearChat, acceptPending, motivation };
            const task = taskMap[key];
            if (task) {
                cron.schedule(job.cronExpression, task, { timezone });
            }
        }
    });
};
