const fs = require("fs");
const login = require("./chatbox-fca-remake/package/index");

// Simple bot. It will respond only if you say "test".
login({appState: JSON.parse(fs.readFileSync('test.json', 'utf8'))}, (err, api) => {
    if (err) return console.error(err);

    api.setOptions({ listenEvents: true});

    const stopListening = api.listenMqtt((err, event) => {
        if (err) return console.error(err);

        api.markAsRead(event.threadID, (err) => {
            if (err) console.error(err);
        });

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
