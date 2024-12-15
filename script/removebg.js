module.exports["config"] = {
        name: 'removebg',
        aliases: ['rmbg'],
        version: '1.1.1',
        role: 0,
        credits: 'developer',
        info: 'Edit photo',
        type: 'Tools',
        usage: '<reply to image> or input url image',
        cd: 8,
};

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs-extra');
const path = require('path');
const { image } = require('image-downloader');

module.exports["run"] = async ({ api, event, args, font, chat }) => {
        var mono = txt => font.monospace(txt);
        if (event.type !== "message_reply" || !event.messageReply.attachments || event.messageReply.attachments.length === 0 || event.messageReply.attachments[0].type !== "photo") {
                return api.sendMessage(mono("You must reply to a valid photo to remove the background."), event.threadID, event.messageID);
        }

        const content = event.messageReply.attachments[0].url;
        const apiKeys = ["DABuioDTVc19SqDGaWS7CjYy", "KW4FmGpWUC6a75gRp8C6n9pB", "jXfRdf2iYgDTqRgbe8Um1LwD"];
        const inputPath = path.resolve(__dirname, 'cache', 'photo.png');

        const removing = await chat.reply(mono("Removing background, please wait..."));

        try {
                await image({ url: content, dest: inputPath });

                const formData = new FormData();
                formData.append('size', 'auto');
                formData.append('image_file', fs.createReadStream(inputPath), path.basename(inputPath));

                const response = await axios.post('https://api.remove.bg/v1.0/removebg', formData, {
                        headers: {
                                ...formData.getHeaders(),
                                'X-Api-Key': apiKeys[Math.floor(Math.random() * apiKeys.length)],
                        },
                        responseType: 'arraybuffer',
                });

                if (response.status !== 200) throw new Error(`Unexpected response status: ${response.status}`);

                fs.writeFileSync(inputPath, response.data);
                api.sendMessage({ attachment: fs.createReadStream(inputPath) }, event.threadID, () => fs.unlinkSync(inputPath));
                removing.unsend();
        } catch (error) {
                api.sendMessage(mono(error.message), event.threadID, event.messageID);
                removing.unsend();
        }
};
