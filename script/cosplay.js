const axios = require("axios");

module.exports["config"] = {
    name: "cosplay",
    aliases: ["cosplaytele", "cosplay18"],
    info: "Fetch a random cosplay image with MediaFire links",
    type: "nsfw",
    version: "1.0.0",
    credits: "Kenneth Panio",
};

module.exports["run"] = async ({ chat, box, font, args, global }) => {
    const query = args.join(' ') || "";
    const mono = txt => font.monospace(txt);

    const load = await chat.reply(mono("Searching Cosplay Photo 📸"));

    try {
        const res = await axios.get(global.api.kokoro[0] + `/cosplay?query=${encodeURIComponent(query)}&filter=true`);

        const mediafireLinks = res.data.mediafire.map(link => `MediaFire Link: ${link}`).join('\n');

        const photo = await box.reply({
            body: `Password: ${res.data.password}\n${mediafireLinks}`,
            attachment: await chat.arraybuffer(res.data.single_img, "png")
        });

        load.unsend();
        photo.unsend(5 * 60000);
    } catch (e) {
        load.unsend();
        const errorMessage = e.response && e.response.data ? e.response.data.message : e.message || "Bot is temporarily blocked by Facebook; can't use this feature!";
        box.reply(mono("ERROR: " + errorMessage));
    }
};