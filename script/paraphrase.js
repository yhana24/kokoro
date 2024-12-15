const axios = require('axios');

module.exports["config"] = {
        name: "paraphrase",
        aliases: ["rephrase", "rewrite"],
        usage: "[text] or reply to a message containing text",
        info: "Paraphrase the provided text or the text in the replied message.",
        guide: "Use 'paraphrase [text]' to paraphrase text directly or reply to a message with 'paraphrase' to rephrase the message text.",
        type: "text-processing",
        credits: "Kenneth Panio",
        version: "1.0.0",
        role: 0,
};

module.exports["run"] = async ({ chat, event, args, font, global }) => {

        const paraphraseText = async (text) => {
                try {
                        const response = await axios.get('https://hook.eu2.make.com/fjadmymn0ekm9s4qw5wqaw61yzf7p7lq', {
                                params: {
                                        'prompt.details': text
                                },
                                headers: {
                                        'Content-Type': 'application/json',
                                        'User-Agent': 'Mozilla/5.0 (Linux; Android 12; Infinix X669 Build/SP1A.210812.016; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/128.0.6613.14 Mobile Safari/537.36',
                                        'Referer': 'https://seo.ai/tools/ai-paraphrasing-tool',
                                }
                        });
                        return { status: true, data: response.data };
                } catch (error) {
                        return { status: false, error: error.message };
                }
        };

        let text = '';

        if (event.type === "message_reply") {
                text = font.origin(event.messageReply.body);
        } else {
                text = font.origin(args.join(' '));
        }

        if (!text.trim()) {
                return chat.reply(font.monospace('Please provide the text to paraphrase or reply to a message containing the text.'));
        }
        
        const ps = await chat.reply(font.monospace("Rephrasing Words..."));

        const result = await paraphraseText(text);

        if (result.status) {
                return chat.reply(font.bold(`PARAPHRASED TEXT:`) + `\n\n${result.data.new_output}`);
        } else {
                return chat.reply(font.monospace(`An error occurred while paraphrasing the text: ${result.error}`));
        }
};
