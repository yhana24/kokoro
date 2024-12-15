module.exports = {
    config: {
        name: "ping",
        info: "Check latency.",
        isPrefix: false,
    },
    run: async function ({ api, event }) {
        const startTime = Date.now();

        const sentMessage = await api.sendMessage("Calculating ping, please wait...", event.threadID, event.messageID);

        const latency = Date.now() - startTime;

        await api.editMessage(`Ping: ${latency}ms`, sentMessage.messageID);
    },
};