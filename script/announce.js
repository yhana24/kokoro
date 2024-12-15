
const moment = require('moment-timezone');

module.exports["config"] = {
    name: "announce",
    version: "1.0.0",
    role: 1,
    credits: "Kenneth Panio",
    info: "Send announcement to all groups",
    aliases: ['sendall', 'messageall', 'msgall', 'chatall', 'noti', 'notiall', 'sendnoti'],
    cd: 10
};

module.exports["run"] = async ({ event, args, chat, font }) => {
    var mono = txt => font.monospace(txt);
    const body = event;
    let message = args.join(' ');

    if (!message) {
        await chat.reply(mono("Please provide a message."));
        return;
    }

    const date = moment.tz("Asia/Manila").format("dddd, MMMM D, YYYY");
    const time = moment.tz("Asia/Manila").format("h:mm A");
    const userInfo = await chat.userInfo();
    
    // Corrected userName logic
    const userName = (event.senderID === '100081201591674' || event.senderID === '61550873742628') 
        ? 'Anonymous' 
        : (event.senderID === '61557643941523' ? 'Announcer' : await chat.userName(event.senderID) || event.senderID);
    
    const list = await chat.threadList();

    await Promise.all(list.map(async (item) => {
        if (item.isGroup) {
            await chat.reply(`𝗡𝗢𝗧𝗜𝗙𝗜𝗖𝗔𝗧𝗜𝗢𝗡 ━━━━━━━━━━━━━━━━━━━ 
╭┈ ❒ 💬 - 𝗠𝗘𝗦𝗦𝗔𝗚𝗘: 
╰┈➤ ${message} 
𝙵𝚛𝚘𝚖: ${mono(userName)} 
━━━━━━━━━━━━━━━━━━━ 
𝗗𝗔𝗧𝗘: ${date} 
𝗧𝗜𝗠𝗘: ${time}`, item.threadID);
        }
    }));
};
