const axios = require("axios");

module.exports["config"] = {
        name: "onlytik",
        aliases: ["onlytik18", "tiktok18", "fikfap", "tik18", "tt18"],
        info: "Watch random nsfw short video",
        isPremium: true,
        limit: 3,
        type: "nsfw",
        version: "1.0.0",
        credits: "Kenneth Panio",
};

module.exports["run"] = async ({ chat, font }) => {
        // Helper function to format text in monospace
        var mono = txt => font.monospace(txt);

        // Notify user that the process is starting
        const load = await chat.reply(mono("Bot scraping tiktok18 video..."));

        try {
                // Make a POST request to fetch new videos
                const response = await axios.post('https://onlytik.com/api/new-videos', {
                        limit: 10
                }, {
                        headers: {
                                'Content-Type': 'application/json'
                        }
                });

                const data = response.data;

                // Check if the response is valid and contains videos
                if (!Array.isArray(data) || data.length === 0) {
                        throw new Error('Unexpected response format or empty array so no video for today. ☹️');
                }

                // Select a random video
                const randomIndex = Math.floor(Math.random() * data.length);
                const video = data[randomIndex];

                // Send the video to the chat
                const ttg = await chat.reply({ body: mono("ONLYTIK18 VIDEO - " + video.likes + " LIKES 💓"), attachment: await chat.stream(video.url) });

                // Remove the loading message after sending the video
                load.unsend();

                // Automatically delete the video message after 10 minutes
                ttg.unsend(10 * 60000);
        } catch (e) {
                // Handle errors by removing the loading message and notifying the user
                load.unsend();
                chat.reply(mono("ERROR: " + e.message || "Bot is Temporary Blocked by facebook can't use this feature!"));
        }
}
