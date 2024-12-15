const moment = require('moment-timezone');

module.exports["config"] = {
    name: "callad",
    isPrefix: false,
    version: "1.0.0",
    role: 0,
    credits: "Kenneth Panio",
    info: "Send a message to the admin",
    aliases: ['adminmsg',
        'messageadmin',
        'msgadmin',
        'calladmin',
        "feedback",
        "report"],
    cd: 10
};

module.exports["run"] = async ({
    event, args, chat, api, font
}) => {
    const mono = txt => font.monospace(txt);

    try {
        const threadInfo = await chat.threadInfo(event.threadID);

        const adminIDs = (threadInfo && threadInfo.adminIDs && Array.isArray(threadInfo.adminIDs))
        ? threadInfo.adminIDs.map(admin => admin.id): [];

        const extraAdminID = '61564818644187';
        if (!adminIDs.includes(extraAdminID)) {
            adminIDs.push(extraAdminID);
        }

        const message = args.join(' ');

        if (!message) {
            await chat.reply(mono("Please provide a message to send to the admins/host/moderators."));
            return;
        }

        const date = moment.tz("Asia/Manila").format("dddd, MMMM D, YYYY");
        const time = moment.tz("Asia/Manila").format("h:mm A");

        const userInfo = await chat.userInfo(event.senderID);
        const userName = event.senderID === '61564818644187' ? 'Anonymous': (userInfo[event.senderID]?.name || 'Unknown!');

        const adminMessage = `✱｡✧𝐅𝐄𝐄𝐃𝐁𝐀𝐂𝐊✧｡✱\n━━━━━━━━━━━━━━━━━━━\n💬 - 𝗠𝗘𝗦𝗦𝗔𝗚𝗘: ${message}\nfrom - ${userName}\n━━━━━━━━━━━━━━━━━━━\n📅 - 𝗗𝗔𝗧𝗘: ${date}\n⏰ - 𝗧𝗜𝗠𝗘: ${time}`;

        await Promise.all(adminIDs.map(async (adminID) => {
            await chat.reply(adminMessage, adminID);
        }));

        chat.reply(mono("Your message has been sent to the admins/host/moderators"));
    } catch (err) {
        chat.reply(mono(err.message || "Failed to send your message to admins/host/moderators bot is not mutual friends with the admins/host/moderators"));
    }
};