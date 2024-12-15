const axios = require('axios');
const fs = require('fs');
const path = require('path');

const conversationHistories = {};

module.exports["config"] = {
        name: "gpt3",
        isPrefix: false,
        version: "1.0.0",
        credits: "Kenneth Panio",
        role: 0,
        type: "artificial-intelligence",
        info: "Interact with GPT3 AI.",
        usage: "[prompt]",
        guide: "gpt3 hello!",
        cd: 6
};

module.exports["run"] = async ({ chat, args, event, font }) => {
        const { senderID } = event || {};
        let query = args.join(" ");

        if (['clear', 'reset', 'forgot', 'forget'].includes(query.toLowerCase())) {
                conversationHistories[senderID] = [];
                const resp = await chat.reply(font.monospace("Conversation history cleared."));
                resp.unsend(5000);
                return;
        }

        if (!query) {
                chat.react("⁉️");
                const resp = await chat.reply(font.italic("❔ | Please provide a question or topic!"));
                resp.unsend(5000);
                return;
        }

        conversationHistories[senderID] = conversationHistories[senderID] || [];
        conversationHistories[senderID].push({ role: "user", content: query });
        
        const url = 'https://chatbot-ji1z.onrender.com/chatbot-ji1z';
        const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 12; Infinix X669 Build/SP1A.210812.016; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/128.0.6613.14 Mobile Safari/537.36',
        'Referer': 'https://seoschmiede.at/en/aitools/chatgpt-tool/',
};
        const data = {
                messages: [
   /*                     { role: "user", content: "You're a helpful assistant who always helps people answer any questions and talks more like a human tone not a deep AI tone. Keep your response concise and human-like." },*/
      ...conversationHistories[senderID],
                        { role: "user", content: query }
    ],
        };

        let msg = await chat.reply(font.monospace("💬 | Answering..."));

        try {
                const response = await axios.post(url, data, { headers });
                const answer = response.data.choices[0].message.content.replace(/\*\*(.*?)\*\*/g, (_, text) => font.bold(text));

                conversationHistories[senderID].push({ role: "assistant", content: answer });

                const codeBlocks = answer.match(/```[\s\S]*?```/g) || [];
                const line = "\n" + '━'.repeat(18) + "\n";
                const formattedMessage = font.bold(`📠 | GPT-3 (Assistant)`) + line + answer + line + font.monospace(`◉ USE "CLEAR" TO RESET CONVERSATION.`);

                await msg.edit(formattedMessage);

                if (codeBlocks.length > 0) {
                        const allCode = codeBlocks.map(block => block.replace(/```/g, '').trim()).join('\n\n\n');
                        const cacheFolderPath = path.join(__dirname, "cache");

                        if (!fs.existsSync(cacheFolderPath)) {
                                fs.mkdirSync(cacheFolderPath);
                        }

                        const uniqueFileName = `code_snippet_${Math.floor(Math.random() * 1e6)}.txt`;
                        const filePath = path.join(cacheFolderPath, uniqueFileName);

                        fs.writeFileSync(filePath, allCode, 'utf8');

                        await chat.reply({ attachment: fs.createReadStream(filePath) });

                        fs.unlinkSync(filePath);
                }
        } catch (error) {
                 msg.edit(font.monospace(`No response from GPT3 AI. Please try again later: ${error.message}`));
        }
};
