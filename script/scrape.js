const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

module.exports["config"] = {
    name: "scrape",
    aliases: ["webscrape"],
    usage: "[url]",
    info: "Scrape the content of a webpage.",
    guide: "Use scrape [url] to scrape the content of a webpage.",
    type: "Web",
    credits: "Kenneth Panio",
    version: "1.0.0",
    role: 0
};

module.exports["run"] = async ({ event, args, chat, font }) => {
    const mono = txt => font.monospace(txt);
    let url;

    if (event.type === "message_reply" && event.messageReply.body) {
        url = event.messageReply.body.trim();
    } else {
        if (args.length === 0) {
            return chat.reply(mono(
                    "Please provide the URL of the webpage to scrape."
                )
            );
        }
        url = args[0].trim();
    }

const urlRegex = /^(https?):\/\/(-\.)?([^\s/?\.#-]+\.?)+([^\s]*)$/i; //regex : )
    if (!urlRegex.test(url)) {
        return chat.reply(mono("Invalid URL format."));
    }

    const headers = {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Kali Linux/99.0.9999.999 Safari/537.36'
    };

    try {
        const response = await axios.get(url, { headers });
        const html = response.data;
        const $ = cheerio.load(html);
        let scrapedData = "";

        $('*').each((index, element) => {
            scrapedData += $(element).html() + "\n";
        });

        const responseHeaders = response.headers;

        const cacheFolderPath = path.join(__dirname, "cache");
        const numeric = Math.floor(Math.random() * 10000);
        const filePath = path.join(
            cacheFolderPath,
            `Scraped_${event.senderID}_${numeric}.txt`
        );
        fs.writeFileSync(filePath, scrapedData, "utf-8");

        const fileStream = fs.createReadStream(filePath);

        await chat.reply({
            body: mono(`Headers: ${JSON.stringify(responseHeaders, null, 2)}`),
            attachment: fileStream
        });

        fs.unlinkSync(filePath);
    } catch (error) {
        chat.reply(mono(`Error: ${error.message}`));
    }
};
