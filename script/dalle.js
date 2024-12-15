const axios = require("axios");

module.exports["config"] = {
    name: "dalle",
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
        return chat.reply(font.thin("Please provide a prompt to generate image. e.g: dalle cat!"));
    }

    const generating = await chat.reply(font.thin("Generating Image •••"));

    try {
        const url = 'https://www.blackbox.ai/api/chat';

        const payload = {
            messages: [{
                content: prompt,
                role: "user"
            }],
            previewToken: null,
            userId: null,
            codeModelMode: true,
            agentMode: {
                mode: true,
                id: "ImageGenerationLV45LJp",
                name: "Image Generation"
            },
            trendingAgentMode: {},
            isMicMode: false,
            maxTokens: 999999999,
            playgroundTopP: null,
            playgroundTemperature: null,
            isChromeExt: false,
            githubToken: null,
            clickedAnswer2: false,
            clickedAnswer3: false,
            clickedForceWebSearch: false,
            visitFromDelta: false,
            mobileClient: false,
            userSelectedModel: null
        };

        const response = await axios.post(url, payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const regex = /!\[.*?\]\((.*?)\)/;
        const match = response.data.match(regex);
        const imageUrl = match ? match[1]: null;

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