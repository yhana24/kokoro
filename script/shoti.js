const axios = require("axios");

const metadata = {
    name: "shoti",
    info: "Sends a random shawty girl video",
    aliases: ["shawty"],
    isPrefix: false,
    version: "1.0.0",
    isPremium: true,
    limit: 3,
    credits: "Kenneth Panio"
};

const execute = async ({
    box, chat, event, args, font
}) => {
    const mono = txt => font.monospace(txt);
    const fetch = await box.reply(mono("Sending Shoti!"))
    try {
        const response = await axios.get("https://betadash-shoti-yazky.vercel.app/shotizxx?apikey=shipazu");

        const {
            shotiurl,
            username
        } = response.data;

        if (!shotiurl) {
            throw new Error("No shawty video found.");
        }

        const attachment = await chat.stream(shotiurl);
        await box.reply({
            body: username, attachment
        });
        fetch.unsend();
    } catch (error) {
        fetch.unsend();
        box.reply(mono(`ERROR: ${error.message}`));
    }
};

module.exports = {
    config: metadata,
    run: execute
};