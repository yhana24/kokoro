const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports["config"] = {
    name: "llava",
    aliases: ["llv"],
    version: "1.0.0",
    credits: "Kenneth Panio",
    role: 0,
    isPrefix: false,
    type: "artificial-intelligence",
    info: "Interact with Llava through LeinGPT API.",
    usage: "[prompt]",
    guide: "llava How does AI work?",
    cd: 6
};

const conversationHistories = {};

module.exports["run"] = async ({ chat, args, event, font }) => {
    const mono = txt => font.monospace(txt);
    const { senderID } = event;
    const query = args.join(" ");

    if (!query) {
        return chat.reply(font.thin("Please provide a text to ask. e.g: llava What is AI?"));
    }

    if (['clear', 'reset', 'forgot', 'forget'].includes(query.toLowerCase())) {
        conversationHistories[senderID] = [];
        return chat.reply(mono("Conversation history cleared."));
    }

    // Initialize conversation history if it does not exist
    if (!conversationHistories[senderID]) {
        conversationHistories[senderID] = [
            {
                role: "system",
                content: "You're Llava, always speak English or use other language if they used another language."
            }
        ];
    }

    // Add the user's message to the conversation history
    conversationHistories[senderID].push({ role: "user", content: query });

    const answering = await chat.reply(mono("🕐 | Generating Response..."));

    const getResponse = async () => {
        return axios.post(
            'https://leingpt.ru/backend-api/v2/conversation',
            {
                conversation_id: chat.botID() + senderID,
                action: "_ask",
                model: "LLava",
                jailbreak: "Обычный",
                tonegpt: "Balanced",
                streamgen: false,
                web_search: false,
                rolej: "default",
                meta: {
                    id: chat.botID() + senderID,
                    content: {
                        conversation: conversationHistories[senderID],
                        content_type: "text",
                        parts: [{ content: query, role: "user" }]
                    }
                }
            },
            {
                headers: {
                    'accept': 'text/event-stream',
                    'content-type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 12; Infinix X669 Build/SP1A.210812.016; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/130.0.6723.27 Mobile Safari/537.36',
                    'Referer': 'https://leingpt.ru/chat/'
                }
            }
        );
    };

    const maxRetries = 3;
    let attempts = 0;
    let success = false;
    let answer = "Under Maintenance!\n\nPlease use other models get started with 'help'";

    while (attempts < maxRetries && !success) {
        try {
            const response = await getResponse();
            answer = response.data.trim().replace(/LeinGPT/g, 'LLava');
            success = true;
        } catch (error) {
            attempts++;
            if (attempts < maxRetries) {
                await answering.edit(mono(`No response from LLava. Retrying... (${attempts} of ${maxRetries} attempts)`));
                await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
            } else {
                await answering.edit(mono("No response from LLava. Please try again later: " + error.message));
                return;
            }
        }
    }

    if (success) {
        conversationHistories[senderID].push({ role: "assistant", content: answer });

        const codeBlocks = answer.match(/```[\s\S]*?```/g) || [];
        const line = "\n" + '━'.repeat(18) + "\n";
        let formattedAnswer = answer.replace(/```/g, '').trim();
        formattedAnswer = formattedAnswer.replace(/\*\*(.*?)\*\*/g, (_, text) => font.bold(text));

        const message = font.bold("🌋 | LLAVA") + line + formattedAnswer + line + mono(`◉ USE "CLEAR" TO RESET CONVERSATION.`);
        await answering.edit(message);

        if (codeBlocks.length > 0) {
            const allCode = codeBlocks.map(block => block.replace(/```/g, '').trim()).join('\n\n\n');
            const cacheFolderPath = path.join(__dirname, "cache");

            if (!fs.existsSync(cacheFolderPath)) fs.mkdirSync(cacheFolderPath);

            const uniqueFileName = `code_snippet_${Math.floor(Math.random() * 1e6)}.txt`;
            const filePath = path.join(cacheFolderPath, uniqueFileName);

            fs.writeFileSync(filePath, allCode, 'utf8');

            const fileStream = fs.createReadStream(filePath);
            await chat.reply({ attachment: fileStream });

            fs.unlinkSync(filePath);
        }
    }
};
