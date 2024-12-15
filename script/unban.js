const fs = require('fs');

module.exports["config"] = {
        name: "unban",
        version: "1.0.3",
        isPrefix: false,
        role: 1,
        aliases: ['whitelist'],
        info: 'Unban users from blacklist.',
        usage: '[mention or user ID | Facebook profile link]',
        credits: 'Kenneth Panio',
};

module.exports["run"] = async ({ event, args, chat, font }) => {
        const getUsername = async (uid) => await chat.userName(uid);
        const botID = await chat.botID();
        const filePath = './data/history.json';

        if (!args.join(" ")) {
                chat.reply(font.italic("Please provide uid or profile link or mention the user to unban!"));
                return;
        }

        try {
                const data = fs.readFileSync(filePath, 'utf8');
                const bots = JSON.parse(data);
                const bot = bots.find(b => b.userid === botID);

                if (!bot) {
                        chat.reply(font.italic("❗ | Current bot ID not found in the blacklist data."));
                        return;
                }

                const { blacklist } = bot;

                const fbLinkRegex = /(?:https?:\/\/)?(?:www\.)?facebook\.com\/(?:profile\.php\?id=)?(\d+)|@(\d+)|facebook\.com\/([a-zA-Z0-9.]+)/i;
                const userIDs = Object.keys(event.mentions).length > 0 ? Object.keys(event.mentions) : args;

                const resolveFBLinks = async (ids) => {
                        const resolvedIDs = [];
                        for (const id of ids) {
                                if (fbLinkRegex.test(id)) {
                                        const uid = await chat.uid(id);
                                        if (uid) {
                                                resolvedIDs.push(uid);
                                        } else {
                                                chat.reply(font.italic(`🚫 | Unable to retrieve UID from the provided Facebook link: ${id}`));
                                        }
                                } else {
                                        resolvedIDs.push(id);
                                }
                        }
                        return resolvedIDs;
                };

                const resolvedUserIDs = await resolveFBLinks(userIDs);

                for (const userID of resolvedUserIDs) {
                        if (blacklist.includes(userID)) {
                                const index = blacklist.indexOf(userID);
                               await blacklist.splice(index, 1);
                               await chat.unblock(userID, 'msg');
                                chat.reply(font.italic(`✅ | Successfully unbanned user: ${await getUsername(userID)}`));
                        } else {
                                chat.reply(font.italic(`⚠️ | This user is not banned: ${await getUsername(userID)}`));
                        }
                }

                fs.writeFileSync(filePath, JSON.stringify(bots, null, 2));
        } catch (error) {
                chat.reply(font.italic(`⚠️ | An error occurred: ${error.message}`));
        }
};
