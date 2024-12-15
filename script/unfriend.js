const run = async ({ chat, args, font }) => {
    const id = args[0];
    const mono = txt => font.monospace(txt);

    if (!id) {
        return chat.reply(mono("Please provide a profile link or UID to unfriend."));
    }

    const facebookLinkRegex = /(?:https?:\/\/)?(?:www\.)?facebook\.com\/(?:profile\.php\?id=)?(\d+)|@(\d+)|facebook\.com\/([a-zA-Z0-9.]+)/i;
    const isFacebookLink = facebookLinkRegex.test(id);

    let uid;
    if (isFacebookLink) {
        uid = await chat.uid(id);
        if (!uid) {
            return chat.reply(mono("Unable to retrieve UID from the provided input."));
        }
    } else if (!isNaN(id)) {
        uid = parseInt(id);
    } else {
        return chat.reply(mono("Invalid input. Please provide a valid profile link or UID."));
    }

    try {
        await chat.unfriend(uid);
        chat.reply(mono("Unfriended successfully."));
    } catch (error) {
        chat.reply(mono("Unable to unfriend. The bot may not be friends with this user ID."));
    }
};

module.exports = {
    run,
    config: {
        name: "unfriend",
        role: 1,
        info: "unfriend the friends of bot",
        isPrefix: true,
        version: "1.0.0",
        credits: "Kenneth Panio",
        cd: 6
    }
};