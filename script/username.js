module.exports["config"] = {
    name: "setusername",
    aliases: ["username"],
    info: "Set bot's username profile link",
    usage: "[username]",
    role: 1,
    credits: "Kenneth Panio",
    cd: 15,
    guide: "setusername pogi1238383",
};

module.exports["run"] = async ({ chat, args, font, prefix, api }) => {
    const username = args.join(" ").replace(/\s+/g, "");

    // Validate username: must be at least 5 characters long and only contain letters, numbers, and dots
    const usernamePattern = /^[a-zA-Z0-9.]{5,}$/;
    if (!username || !usernamePattern.test(username)) {
        return chat.reply(
            font.monospace("Invalid username. It must be at least 5 characters long and only contain letters, numbers, and dots. Example: setusername pogi.ko12345")
        );
    }

    try {
        await api.changeUsername(username);
        chat.reply("Successfully Set Username: " + "https://www.facebook.com/" + username);
    } catch (error) {
        chat.reply(font.monospace(error.message || "Failed to set username. its not allowed or must wait few days or months."));
    }
};