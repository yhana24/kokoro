const axios = require("axios");

module.exports["config"] = {
    name: 'wholesome',
    aliases: ['hsauce', 'tgook'],
    info: 'random wholesome hentai',
    role: 0,
    type: 'nsfw',
    credits: 'Atomic-Zero',
    version: '2.0.0',
};

module.exports["run"] = async ({ chat, event, font }) => {
    let sauce;
    try {
        const { messageID } = event;
        const response = await axios.get('https://wholesomelist.com/api/random');
        const mangaData = response.data.entry;
        sauce = await chat.reply(font.italic("Looking For Random Sauce..."));
        sauce.unsend(60000);
        
        const imgUrl = mangaData.image;
        const tags = mangaData.siteTags ? mangaData.siteTags.tags.join(', ') : 'No Available Tags';
        const message = font.monospace(`𝗧𝗶𝘁𝗹𝗲: ${mangaData.title}\n𝗔𝘂𝘁𝗵𝗼𝗿: ${mangaData.author}\n𝗧𝗮𝗴𝘀: ${tags}\n`) + `𝗡𝗵𝗲𝗻𝘁𝗮𝗶: ${mangaData.nh}\n𝗘-𝗛𝗲𝗻𝘁𝗮𝗶: ${mangaData.eh}`;
        sauce.edit(message);

        const wholesome = await chat.reply({ attachment: await chat.arraybuffer(imgUrl) });
        wholesome.unsend(60000);
        
    } catch (error) {
        chat.reply(font.italic("Error fetching wholesome pics:" + error.message));
    }
};
