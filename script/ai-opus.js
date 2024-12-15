const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports["config"] = {
    name: "opus",
    version: "1.0.0",
    credits: "Kenneth Panio",
    role: 0,
    isPrefix: false,
    type: "artificial-intelligence",
    info: "Interact with Claude Opus AI",
    usage: "[prompt]",
    guide: "opus How does quantum computing work?",
    isPremium: true,
    limit: 10,
    cd: 6,
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

    if (!query) {
        return chat.reply(font.thin("Please provide a text to ask. e.g: opus explain the theory of relativity"));
    }

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

    const apiUrl = 'https://api.voids.top/v1/chat/completions';
    const headers = {
        'accept': 'application/json, text/event-stream',
        'accept-language': 'ru,en;q=0.9',
        'content-type': 'application/json',
        'priority': 'u=1, i',
        'sec-ch-ua': '"Chromium";v="124", "YaBrowser";v="24.6", "Not-A.Brand";v="99", "Yowser";v="2.5"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'plugins': '0',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'x-requested-with': 'XMLHttpRequest',
        'Referer': apiUrl,
        'Referrer-Policy': 'strict-origin-when-cross-origin'
    };

    const data = {
        messages: conversationHistories[senderID],
        model: 'claude-3-opus-20240229'
    };

    const getResponse = async () => {
        return axios.post(apiUrl, data, {
            headers
        });
    };

    const shortenUrl = async (url) => {
        try {
            const response = await axios.get(global.api.kokoro[0] + `/tinyurl?url=${encodeURIComponent(url)}`);
            return response.data.short;
        } catch (error) {
            return url;
        }
    };

    const processShortUrls = async (text) => {
        const urlRegex = /(https?:\/\/[^\s)]+)/g;
        const urls = [...text.matchAll(urlRegex)].map(match => match[0]);
        const shortenedUrls = await Promise.all(
            urls.map(async (url) => ({
                original: url, short: await shortenUrl(url)
            }))
        );
        let processedText = text;
        shortenedUrls.forEach(({
            original, short
        }) => {
            processedText = processedText.replace(new RegExp(original, 'g'), short);
        });
        return processedText;
    };

    const isImageUrl = async (url) => {
        try {
            const response = await axios.head(url);
            return response.headers['content-type'].startsWith('image');
        } catch (error) {
            return false;
        }
    };

    const maxRetries = 3;
    let attempts = 0;
    let success = false;
    let answer = "Under Maintenance!\n\nPlease try again later.";

    while (attempts < maxRetries && !success) {
        try {
            const response = await getResponse();
            answer = response.data.choices[0].message.content.trim();
            success = true;
        } catch (error) {
            attempts++;
            if (attempts < maxRetries) {
                await answering.edit(mono(`No response from VOID API. Retrying... (${attempts} of ${maxRetries} attempts)`));
                await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
            } else {
                answering.edit(mono("No response from VOID API. Please try again later: " + error.message));
                return;
            }
        }
    }

    if (success) {
        conversationHistories[senderID].push({
            role: "assistant", content: answer
        });
        const processedAnswer = await processShortUrls(answer);
        const codeBlocks = answer.match(/```[\s\S]*?```/g) || [];
        const imageUrlRegex = /!\[.*?\]\((https?:\/\/[^\s)]+)\)/g;
        const line = "\n" + '━'.repeat(18) + "\n";
        const formattedAnswer = processedAnswer.replace(/\*\*(.*?)\*\*/g, (_, text) => font.bold(text));
        const message = font.bold(`🌐 | ${data.model.toUpperCase()}`) + line + formattedAnswer + line + mono(`◉ USE "CLEAR" TO RESET CONVERSATION.`);
        await answering.edit(message);

        if (codeBlocks.length > 0) {
            const allCode = codeBlocks.map(block => block.replace(/```/g, '').trim()).join('\n\n\n');
            const cacheFolderPath = path.join(__dirname, "cache");
            if (!fs.existsSync(cacheFolderPath)) {
                fs.mkdirSync(cacheFolderPath);
            }
            const uniqueFileName = `code_snippet_${Math.floor(Math.random() * 1e6)}.txt`;
            const filePath = path.join(cacheFolderPath, uniqueFileName);
            fs.writeFileSync(filePath, allCode, 'utf8');
            const fileStream = fs.createReadStream(filePath);
            await chat.reply({
                attachment: fileStream
            });
            fs.unlinkSync(filePath);
        }

        const imageUrls = [];
        let imageMatch;
        while ((imageMatch = imageUrlRegex.exec(answer)) !== null) {
            const [_,
                imageUrl] = imageMatch;
            if (await isImageUrl(imageUrl)) {
                imageUrls.push(imageUrl);
            }
        }

        if (imageUrls.length > 0) {
            await chat.reply({
                attachment: await Promise.all(imageUrls.map(url => chat.stream(url)))
            });
        }
    }
};

/* Available models: gpt-4o-mini-free
gpt-4o-mini
gpt-4o-free
gpt-4-turbo-2024-04-09
gpt-4o-2024-08-06
grok-2
grok-2-mini
claude-3-opus-20240229
claude-3-opus-20240229-gcp
claude-3-sonnet-20240229
claude-3-5-sonnet-20240620
claude-3-haiku-20240307
claude-2.1
gemini-1.5-flash-exp-0827
gemini-1.5-pro-exp-0827*/