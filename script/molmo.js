const axios = require("axios");

module.exports["config"] = {
    name: "molmo",
    aliases: ["flux"],
    isPrefix: false,
    version: "1.0.0",
    info: "generates image",
    usage: "[prompt]",
    credits: "Kenneth Panio",
};

module.exports["run"] = async ({
    chat, args, font
}) => {
    const prompt = args.join(" ");

    if (!prompt) {
        return chat.reply(font.thin("Please provide a prompt to generate image. e.g: molmo cat!"));
    }

    const generating = await chat.reply(font.thin("Generating Image •••"));

    try {
        const url = 'https://molmo.org/api/generateImg';

        const response = await axios.post(url, { prompt: prompt }, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 12; Infinix X669 Build/SP1A.210812.016; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/130.0.6723.40 Mobile Safari/537.36',
                'Referer': 'https://molmo.org/dashboard'
            }
        });

        const imageUrl = response.data;

        generating.unsend();


        if (!imageUrl) {
            return chat.reply(font.thin("Image Generation Temporary Unavailable!"));
        }

        chat.reply({
            attachment: await chat.stream(imageUrl)
        });
    } catch (error) {
        generating.unsend();
        chat.reply(font.thin(error.message));
    }
};