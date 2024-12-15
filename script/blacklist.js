const fs = require('fs');

module.exports["config"] = {
        name: "ban",
        version: "1.0.4",
        isPrefix: false,
        role: 1,
        aliases: ['blacklist'],
        info: 'Ban users added to blacklist or list all banned users.',
        usage: '[mention or user ID | Facebook profile link | list]',
        credits: 'Kenneth Panio',
};

module.exports["run"] = async ({ event, args, chat, font }) => {
        const getUsername = async (uid) => await chat.userName(uid);
        const botID = await chat.botID();
        const filePath = './data/history.json';

        if (!args.join(" ")) {
                chat.reply(font.italic("Please provide uid or profile link or mention the user to ban!"));
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

                if (args[0] === 'list') {
                        if (blacklist.length === 0) {
                                chat.reply(font.italic("🥱 | No users are currently banned."));
                                return;
                        }

                        const bannedList = await Promise.all(
                                blacklist.map(async (userID, index) => {
                                        const name = await getUsername(userID);
                                        return `${index + 1}. ${name}: ${userID}`;
                                })
                        );

                        chat.reply(font.italic(`🚫 | Banned users:\n${bannedList.join('\n')}`));
                        return;
                }

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
                        if (!blacklist.includes(userID)) {
                                await blacklist.push(userID);
                                await chat.block(userID);
                                chat.reply(font.italic(`✅ | Successfully ban user: ${await getUsername(userID)}`));
                        } else {
                                chat.reply(font.italic(`⚠️ | You already banned this user: ${await getUsername(userID)}`));
                        }
                }

                fs.writeFileSync(filePath, JSON.stringify(bots, null, 2));
        } catch (error) {
                chat.reply(font.italic(`⚠️ | An error occurred: ${error.message}`));
        }
};
