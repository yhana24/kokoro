const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports["config"] = {
    name: "gpt4of",
    aliases: ["gpt4o", "gpt4"],
    version: "1.0.0",
    credits: "Kenneth Panio",
    role: 0,
    isPrefix: false,
    type: "artificial-intelligence",
    info: "Interact with GPT-4o Free using the API. Specialized in answering queries, generating files, sending images, and more.",
    usage: "[prompt]",
    guide: "gpt4of How does quantum computing work?",
    cd: 6
};

const conversationHistories = {};

module.exports["run"] = async ({
    chat, args, event, font, global
}) => {
    const mono = txt => font.monospace(txt);
    const {
        senderID
    } = event;
    let query = args.join(" ");

    if (!query) return chat.reply(font.thin("Please provide a text to ask. e.g: ai explain the theory of relativity"));

    if (['clear', 'reset', 'forgot', 'forget'].includes(query.toLowerCase())) {
        conversationHistories[senderID] = [];
        chat.reply(mono("Conversation history cleared."));
        return;
    }

    const answering = await chat.reply(mono("🕐 | Generating Response..."));

    conversationHistories[senderID] = conversationHistories[senderID] || [];
    conversationHistories[senderID].push({
        role: "user", content: query
    });

    const apiUrl = global.api.eqing + `/api/openai/v1/chat/completions`;

    const headers = {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5OTVjMGQxNS03NzJjLTQ5ODAtOGQ3NS0xZGNhNTUyM2I3NmQiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzI5MDMyOTgwLCJpYXQiOjE3Mjg2NzI5ODAsImVtYWlsIjoibGtwYW5pbzI1QGdtYWlsLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZ2l0aHViIiwicHJvdmlkZXJzIjpbImdpdGh1YiJdfSwidXNlcl9tZXRhZGF0YSI6eyJhdmF0YXJfdXJsIjoiaHR0cHM6Ly9hdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzE1MjI2NzE0MD92PTQiLCJlbWFpbCI6ImxrcGFuaW8yNUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZnVsbF9uYW1lIjoiSGFqaW1lIFl1dXRhIiwiaXNzIjoiaHR0cHM6Ly9hcGkuZ2l0aHViLmNvbSIsIm5hbWUiOiJIYWppbWUgWXV1dGEiLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInByZWZlcnJlZF91c2VybmFtZSI6ImF0b21pYy16ZXJvIiwicHJvdmlkZXJfaWQiOiIxNTIyNjcxNDAiLCJzdWIiOiIxNTIyNjcxNDAiLCJ1c2VyX25hbWUiOiJhdG9taWMtemVybyJ9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6Im9hdXRoIiwidGltZXN0YW1wIjoxNzI4NjcyOTgwfV0sInNlc3Npb25faWQiOiJiZjcxY2ExNS1iMTIxLTQ3OTUtOTMxMS0xOTk0NzgxOTJmZDEiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.Xinz-t88HO0xKZlmFaPMGIM_PZpVdRgCu-xU9MOaQlI',
        'Content-Type': 'application/json',
        'x-requested-with': 'XMLHttpRequest',
        'useSearch': 'false',
        'x-guest-id': 'LKkc7B5BECo6_nFmyLhFw',
        'accept': 'application/json',
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://origin.eqing.tech/#/chat'
    };

    const data = {
        "messages": conversationHistories[senderID],
        "stream": true,
        "model": "gpt-4o-free",
        "temperature": 0.5,
        "presence_penalty": 0,
        "frequency_penalty": 0,
        "top_p": 1,
        "max_tokens": 28000,
        "captchaToken": "eyJhbGdvcml0aG0iOiJTSEEtNTEyIiwiY2hhbGxlbmdlIjoiNDIzZjBiYTJlNjRjZjM4YjdiY2I3ZmIyNjU4MDllYTY2MGI2NTU0NmJkZTI1NjVhYWRlMzYzMzk5YTdiZmUzMmU3NTU3ZTMyYTJkYzExNGFlMWZiYmE4ZjEwZjRkMzIzYzZmMzgyMTRkOWE4MGVjYjg1YWM1OTExOTNiODQ1ZjgiLCJudW1iZXIiOjQ2ODk5OSwic2FsdCI6ImE4YTkzZThmNWYzNGYzYmEwZWFiNTljNmQ4NzMxNjlkYWEwZjAyM2M/ZXhwaXJlcz0xNzM0MTM4OTIyIiwic2lnbmF0dXJlIjoiZDBkOTJiOGVhYmRmYmI4OTg5YjAzMzMzMjIzZGQyN2IxODZmNWEzZWEyMDQ3NDYxMjA5NmFlNGYxNjBlMjFlZTIwMTdjYWQzMTcxY2IwNzQ1NWRmYjc3MjUwOWY1YTdjNmIzMjczZGVlMGJkMTI4OTFmNDk5ZGIwYjIyNjE2MzQiLCJ0b29rIjo2NTY3NH0="
    };

    try {
        const response = await axios.post(apiUrl, data, {
            headers
        });
        const rawResponse = response.data;

        // Process scattered JSON messages
        const lines = rawResponse.split('\n');
        let fullContent = '';

        for (const line of lines) {
            if (line.trim() === "data: [DONE]") {
                break; // End processing on [DONE]
            }

            if (line.trim().startsWith("data:")) {
                const jsonString = line.substring(5).trim();
                if (jsonString) {
                    try {
                        const parsed = JSON.parse(jsonString);
                        const delta = parsed.choices[0].delta?.content || '';
                        fullContent += delta;
                    } catch (err) {
                        console.error("Error parsing JSON:", err.message);
                    }
                }
            }
        }

        fullContent = fullContent
        .replace(/> provided by \[EasyChat\]\(https:\/\/site\.eqing\.tech\/\)/g, '').trim();
        conversationHistories[senderID].push({
            role: "assistant", content: fullContent
        });

        const line = "\n" + '━'.repeat(18) + "\n";
        const formattedAnswer = fullContent.replace(/\*\*(.*?)\*\*/g, (_, text) => font.bold(text));
        const message = font.bold(`🗞️ | ${data.model.toUpperCase()}`) + line + formattedAnswer + line + mono(`◉ USE "CLEAR" TO RESET CONVERSATION.`);
        answering.edit(message);
    } catch (error) {
        console.error("Error during request:", error.response?.data || error.message);
        answering.edit(mono("No response from GPT-4o AI. Please try again later."));
    }
};