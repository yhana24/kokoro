module.exports["config"] = {
        name: "flash",
        info: "sends a gif that can cause blind to users (effective during night time and dark place)",
        version: "1.2.3",
        aliases: ["flashbang"],
        type: "troll",
        isPrefix: false,
        cd: 10
};

module.exports["run"] = async ({ chat, font }) => {
        try {
                chat.reply({ attachment: await chat.stream("https://i.imgur.com/fhspaVM.gif") });
        } catch (error) {
                chat.reply(font.monospace(error.message));
        }
}