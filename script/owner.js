module.exports["config"] = {
        name: "owner",
        info: "Check information about the owner of the bot",
        cd: 20,
        isPrefix: false,
};//

module.exports["run"] = async ({ chat, font }) => {
        try {
                const info = {
                        owner: "Kenneth Panio",
                        video: "https://i.imgur.com/bcGR7Up.mp4",
                        bio: "Coding is Life!",
                        hobby: "Programming, drawing",
                        status: "Single",
                        zodiac: "Scorpio"
                };

                const message = font.monospace(`• | OWNER INFORMATION | •\n\n` +
                        `Name: ${info.owner}\n` +
                        `Bio: ${info.bio}\n` +
                        `Hobby: ${info.hobby}\n` +
                        `Status: ${info.status}\n` +
                        `Zodiac: ${info.zodiac}`);

                // First, reply with the information
                 chat.reply(message);

                // Stream the video and reply with the attachment
                const url = await chat.stream(info.video);
                if (url) {
                        return chat.reply({ attachment: url });
                }

        } catch (error) {
                chat.reply(font.monospace(error.message));
        }
};