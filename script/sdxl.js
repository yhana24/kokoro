const axios = require('axios');
const randomUseragent = require('random-useragent');

module.exports.config = {
        name: "sdxl",
        aliases: ["vivid", "lucid"],
        info: "Generate AI art",
        version: "1.0.1",
        type: "ai-image-generator",
        isPrefix: false,
        usage: "[model number] [prompt]",
        role: 0,
};

module.exports.run = async ({ event, args, chat, font, global }) => {
        const { api } = global;
        const { key, models } = api.workers.huggingface;
        const imagine = models.imagine;

        let modelIndex;
        let prompt;

        if (args.length < 1) {
                const modelList = imagine.map((model, index) => `  ${index + 1}. ${model.split('/').pop()}`).join("\n");
                chat.reply(font.monospace(`Available models:\n\n${modelList}\n\nExample: sdxl 3 a dog outside house.`));
                return;
        }

        const firstArg = args[0];
        if (!isNaN(parseInt(firstArg))) {
                modelIndex = parseInt(firstArg) - 1;
                if (modelIndex < 0 || modelIndex >= imagine.length) {
                        modelIndex = 0;
                }
                prompt = args.slice(1).join(" ");
        } else {
                modelIndex = imagine.findIndex(model => model.toLowerCase().includes(firstArg.toLowerCase()));
                if (modelIndex === -1) {
                        modelIndex = 0;
                }
                prompt = args.join(" ");
        }

        if (!prompt.trim()) {
                chat.reply(font.monospace(`Please provide a prompt for the selected model.`));
                return;
        }

        const selectedModel = imagine[modelIndex].split('/').pop();
        const apiUrl = "https://api-inference.huggingface.co/models/" + imagine[modelIndex];

        try {
                const answering = await chat.reply(font.monospace(`Generating image with ${selectedModel} model...`));

                const response = await axios.post(apiUrl, { inputs: prompt }, {
                        headers: {
                                'Authorization': 'Bearer ' + (atob(key)),
                                'Content-Type': 'application/json',
                                'User-Agent': randomUseragent.getRandom()
                        },
                        responseType: 'stream' // Stream the response
                });

                // Stream the response data directly to the chat reply
                chat.reply({
                        attachment: response.data
                });

                answering.unsend();

        } catch (error) {
            if (error.response && error.response.status === 403) {
                return chat.reply(font.monospace("Forbidden for now try other models!"))
            }
                chat.reply(font.monospace(`Error: ${error.message}`));
        }
};
