const fs = require("fs");
const login = require("./chatbox-fca-remake/package/index");

// Simple bot. It will respond only if you say "test".
login({
    appState: JSON.parse(fs.readFileSync('test.json', 'utf8'))}, (err, api) => {
    if (err) return console.error(err);

    api.setOptions({
        forceLogin: true,
        listenEvents: true,
        logLevel: "silent",
        updatePresence: true,
        selfListen: false,
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:118.0) Gecko/20100101 Firefox/118.0",
        online: false,
        autoMarkDelivery: false,
        autoMarkRead: false
    });

    const stopListening = api.listenMqtt((err, event) => {
        if (err) return console.error(err);

        switch (event.type) {
            case "message":
                if (event.body === '/stop') {
                    api.sendMessage("Goodbye…", event.threadID);
                    return stopListening();
                }
                if (event.body.toLowerCase() === 'test') {
                    api.sendMessage("TEST BOT: " + event.body, event.threadID);
                }
                break;
            case "event":
                console.log(event);
                break;
        }
    });
});