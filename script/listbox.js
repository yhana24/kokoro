module.exports["config"] = {
    name: 'listbox',
    version: '1.0.0',
    credits: 'Kenneth Panio',
    role: 1,
    info: 'List threads bot participated in',
    type: 'thread',
    cd: 15
};

module.exports["run"] = async ({ chat, event, args, font }) => {
    try {
        const inbox = await chat.threadList();
        const list = inbox.filter(group => group.isSubscribed && group.isGroup);

        if (list.length === 0) {
            return chat.reply(font.monospace("There are no groups available."));
        }

        if (args.length >= 1) {
            const action = args[0].toLowerCase();

            if (action === "out" || action === "join") {
                let results = [];

                if (args[1] && args[1].toLowerCase() === "all") {
                    // Bulk action for all threads
                    for (const group of list) {
                        const threadID = group.threadID;
                        const threadInfo = await chat.threadInfo(threadID);

                        if (action === "out") {
                            await chat.kick(chat.botID(), threadID);
                            results.push(`Left thread with ID: ${threadID}\n${threadInfo.threadName || "Unnamed Group"}`);
                        } else if (action === "join") {
                            if (threadInfo.approvalMode) {
                                const botID = chat.botID();
                                const threadAdmins = threadInfo.adminIDs.map(admin => admin.id);
                                if (!threadAdmins.includes(botID)) {
                                    results.push(`Cannot join '${threadInfo.threadName || "Unnamed Group"}' due to admin approval required.`);
                                    continue; // Skip to next group
                                }
                            }
                            await chat.add(event.senderID, threadID);
                            results.push(`Added to group '${threadInfo.threadName || "Unnamed Group"}' even though admin approval may be required.`);
                        }
                    }

                    // Send a single message with all results
                    return chat.reply(font.monospace(results.join('\n') || "No actions were performed."));
                } else {
                    const threadIndex = parseInt(args[1]) - 1;

                    if (isNaN(threadIndex) || threadIndex < 0 || threadIndex >= list.length) {
                        return chat.reply(font.monospace(`Invalid thread number.`));
                    }

                    const threadID = list[threadIndex].threadID;
                    const threadInfo = await chat.threadInfo(threadID);

                    if (action === "out") {
                        await chat.kick(chat.botID(), threadID);
                        const groupName = threadInfo.threadName || "Unnamed Group";
                        return chat.reply(font.monospace(`Left thread with ID: ${threadID}\n${groupName}`));
                    }

                    if (action === "join") {
                        if (threadInfo.approvalMode) {
                            const botID = chat.botID();
                            const threadAdmins = threadInfo.adminIDs.map(admin => admin.id);
                            if (!threadAdmins.includes(botID)) {
                                return chat.reply(font.monospace(`Cannot add you to the group '${threadInfo.threadName || "Unnamed Group"}' because admin approval is required and I am not an admin there.`));
                            }
                        }
                        await chat.add(event.senderID, threadID);
                        const groupName = threadInfo.threadName || "Unnamed Group";
                        return chat.reply(font.monospace(`Added you to the group '${groupName}' even though admin approval may be required.`));
                    }
                }
            }

            return chat.reply(font.monospace(`Invalid action. Please use 'out', 'join', 'out all', or 'join all'.`));
        }

        let msg = '';
        list.forEach((group, index) => {
            msg += `${index + 1}. ${group.threadName || "Unnamed Group"}\nTID: ${group.threadID}\n\n`;
        });
        chat.reply(font.monospace(msg + 'To leave the first thread, e.g: listbox out 1\nTo join the first thread, e.g: listbox join 1 or "all" for bulk actions'));

    } catch (error) {
        chat.reply(font.monospace("The feature is temporarily unavailable (Blocked By Meta!)."));
    }
};