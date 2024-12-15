const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports["config"] = {
    name: "aimath",
    aliases: ["mathai", "math-gpt", "math"],
    version: "1.0.0",
    credits: "Kenneth Panio",
    role: 0,
    isPrefix: false,
    type: "artificial-intelligence",
    info: "Interact with the Math AI using the API. Specialized in solving math problems and providing explanations.",
    usage: "[math_prompt]",
    guide: "aimath Solve the equation x^2 + 4x + 4 = 0",
    cd: 6
};

const conversationHistories = {};

module.exports["run"] = async ({ chat, args, event, font, global }) => {
    const mono = txt => font.monospace(txt);
    const { senderID } = event;
    let query = args.join(" ");

    if (!query) return chat.reply(font.thin("Please provide a math prompt to ask. e.g: aimath Solve x^2 + 4x + 4 = 0"));

    if (['clear', 'reset', 'forgot', 'forget'].includes(query.toLowerCase())) {
        conversationHistories[senderID] = [];
        chat.reply(mono("Conversation history cleared."));
        return;
    }

    const answering = await chat.reply(mono("🕐 | Generating Math Response..."));

    conversationHistories[senderID] = conversationHistories[senderID] || [];
    conversationHistories[senderID].push({ role: "user", content: query });

    const AiMath = async (messages) => {
        const url = "https://aimathgpt.forit.ai/api/ai";
        const headers = {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36",
            Referer: "https://aimathgpt.forit.ai/#pricing",
            "Accept-Encoding": "gzip, deflate"
        };
        const data = {
            messages: [
                {
                    role: "system",
                    content: "You are an expert math tutor. For each question, provide: 1) A clear, step-by-step problem-solving approach. 2) A concise explanation of the underlying concepts. 3) One follow-up question to deepen understanding. 4) A helpful tip or common pitfall to watch out for. Keep your responses clear and concise."
                },
                ...messages
            ],
            model: "llama3"
        };

        try {
            const response = await axios.post(url, data, { headers });
            return response.data?.result?.response;
        } catch (error) {
            return null;
        }
    };

    const answer = await AiMath(conversationHistories[senderID]);
    
    const formattedAnswer = answer.replace(/\*\*(.*?)\*\*/g, (_, text) => font.bold(text));

    if (answer) {
        conversationHistories[senderID].push({
            role: "assistant", content: answer
        });

        const line = "\n" + '━'.repeat(18) + "\n";
        const message = font.bold("🤖️ | MATH AI") + line + formattedAnswer + line + mono(`◉ USE "CLEAR" TO RESET CONVERSATION.`);
        answering.edit(message);
    } else {
        answering.edit(mono("Something wen't wrong with the server. Please try again later."));
    }
};
