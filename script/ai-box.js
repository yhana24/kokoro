
const axios = require("axios");
const fs = require('fs');
const path = require('path');

module.exports["config"] = {
    name: "box",
    aliases: ["bb", "blackbox", "blackbox-ai"],
    version: "1.0.0",
    credits: "Kenneth Panio",
    role: 0,
    isPrefix: false,
    type: "artificial-intelligence",
    info: "Interact with blackbox-ai. Specialized in programming and finding source code.",
    usage: "[prompt]",
    guide: "blackbox How does nuclear fusion work?",
    cd: 6
};

const conversationHistories = {};
let webSearchMode = true;
let codeModelMode = true;

module.exports["run"] = async ({ chat, args, event, font, global }) => {
    var mono = txt => font.monospace(txt);
    const { threadID, senderID } = event;
    const query = args.join(" ");
    
    if (!query) return chat.reply(font.thin("Please provide a text to ask. e.g: box generate a python program rest api example?"));

    if (['clear', 'reset', 'forgot', 'forget'].includes(query.toLowerCase())) {
        conversationHistories[senderID] = [];
        chat.reply(mono("Conversation history cleared."));
        return;
    }

    if (query.toLowerCase() === 'toggle') {
        webSearchMode = !webSearchMode;
        chat.reply(mono(`Web search mode has been ${webSearchMode ? 'enabled' : 'disabled'}.`));
        return;
    }
    
    if (query.toLowerCase() === 'code') {
        codeModelMode = !codeModelMode;
        chat.reply(mono(`Code model mode has been ${codeModelMode ? 'enabled' : 'disabled'}.`));
        return;
    }

    const answering = await chat.reply(mono("🕐 | Generating Response..."));

    conversationHistories[senderID] = conversationHistories[senderID] || [];
    conversationHistories[senderID].push({ role: "user", content: query });

    const getResponse = async () => {
        return axios.post(global.api["chatbox"], {
            messages: conversationHistories[senderID],
            clickedContinue: false,
            previewToken: null,
            codeModelMode,
            agentMode: {},
            trendingAgentMode: {},
            isMicMode: false,
            isChromeExt: false,
            clickedAnswer2: false,
            clickedAnswer3: false,
            githubToken: atob("Z2hwX3V5VEZydEViQ051WjVQaVdhV3d3bHlrT1dnR0p2OTM5NEk4Mg=="),
            webSearchMode,
            userSystemPrompt: null,
            visitFromDelta: false,
            mobileClient: false,
            maxTokens: '999999999999'
        }, {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36"
        });
    };

    const maxRetries = 3;
    let attempts = 0;
    let success = false;
    let answer = "Under Maintenance!\n\nPlease use other models get started with 'help'";
    
    while (attempts < maxRetries && !success) {
        try {
            const response = await getResponse();
            answer = response.data.replace(/\$@\$(.*?)\$@\$/g, '').trim();
            success = true;
        } catch (error) {
            attempts++;
            if (attempts < maxRetries) {
                await answering.edit(mono(`No response from Blackbox AI. Retrying... (${attempts} of ${maxRetries} attempts)`));
                await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
            } else {
                answering.edit(mono("No response from Blackbox AI. Please try again later: " + error.message));
                return;
            }
        }
    }

    if (success) {
        conversationHistories[senderID].push({
            role: "assistant", content: answer
        });

        if (webSearchMode) {
            try {
                const sources = extractSources(answer);
                answer = answer.replace(/\$~~~\$[\s\S]*?\$~~~\$/g, '').trim();
                if (sources.length > 0) {
                    answer += font.bold("\n\nTop Sources:\n\n") + sources.map((source, index) => font.bold(`${index + 1}. ${source.title}\n`) + mono(`${source.snippet}\n\n`) + `${source.link}`).join("\n\n");
                }
            } catch (error) {
                answering.edit(mono("Error extracting sources."));
            }
        }

        const codeBlocks = answer.match(/```[\s\S]*?```/g) || [];
        const line = "\n" + '━'.repeat(18) + "\n";
        
        answer = answer.replace(/Generated by BLACKBOX\.AI, try unlimited chat https:\/\/www\.blackbox\.ai/g, "").trim();

        answer = answer.replace(/\*\*(.*?)\*\*/g, (_, text) => font.bold(text));

        const message = font.bold("⬛ | BLACKBOX AI") + line + answer + line + mono(`◉ USE "CLEAR" TO RESET CONVERSATION.\n◉ USE "TOGGLE" TO SWITCH WEBSEARCH\n◉ USE "CODE" TO SWITCH CODING MODEL.`);

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
    }
};

function extractSources(answer) {
    const sourceRegex = /\{.*?"title":\s*"(.*?)".*?"link":\s*"(.*?)".*?"snippet":\s*"(.*?)".*?\}/g;
    const sources = [];
    let match;

    while ((match = sourceRegex.exec(answer)) !== null) {
        const title = match[1].replace(/\\u[\dA-F]{4}/gi, (match) => String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16))).trim();
        const link = match[2].trim();
        const snippet = match[3].replace(/\\n/g, ' ').replace(/\\u[\dA-F]{4}/gi, (match) => String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16))).trim();
        sources.push({
            title, link, snippet
        });
    }

    return sources;
}