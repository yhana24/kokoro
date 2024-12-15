const axios = require('axios');
const fs = require('fs-extra');
const request = require('request');
const path = require('path');
const crypto = require('crypto');

module.exports["config"] = {
    name: "element",
    version: "1.0.0",
    role: 0,
    credit: "Joshua Sy",
    usage: '[name]',
    info: "Get information of elements from the periodic table",
    cd: 10,
};

module.exports["run"] = async function({ api, event, args, utils, chat, font }) {
    var mono = txt => font.monospace(txt);
    const { threadID, senderID, messageID } = event;
    const elementName = args.join(" ");

    if (!elementName) {
        return chat.reply(mono(`Please provide the name of a periodic table element.`));
    }

    try {
        const res = await axios.get(`https://api.popcat.xyz/periodic-table?element=${encodeURIComponent(elementName)}`);
        const data = res.data;
        
        // Generate a random filename with .png extension
        const randomFilename = crypto.randomBytes(16).toString('hex') + '.png';
        const imageFilePath = path.join(__dirname, 'cache', randomFilename);

        // Download the image
        await new Promise((resolve, reject) => {
            request(data.image)
                .pipe(fs.createWriteStream(imageFilePath))
                .on('finish', resolve)
                .on('error', reject);
        });

        // Send the reply with the image
        await chat.reply({
            attachment: fs.createReadStream(imageFilePath)
        });
        
        await chat.reply(mono(`Element Name: ${data.name}\nSymbol: ${data.symbol}\nAtomic Number: ${data.atomic_number}\nAtomic Mass: ${data.atomic_mass}\n\nSummary: ${data.summary}`));

        // Clean up the downloaded image
        fs.unlinkSync(imageFilePath);

    } catch (err) {
        chat.reply(mono(`Failed to retrieve data for the element: ${elementName}. Please check the name and try again.`));
    }
};