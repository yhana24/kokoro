module.exports["config"] = {
        name: 'supportgc',
        aliases: ["maingc", "join"],
        version: '1.0.0',
        credits: 'Kenneth Panio',
        role: 0,
        info: 'Add user to main group chat',
        type: 'thread',
        cd: 15
};

module.exports["run"] = async ({ chat, event, font }) => {
        const maingcID = 6843550052392742;
        let threadInfo;

        try {
                threadInfo = await chat.threadInfo(maingcID);
                const { participantIDs, approvalMode, adminIDs } = threadInfo;
                const parsedParticipantIDs = participantIDs.map(e => parseInt(e));

                if (parsedParticipantIDs.includes(event.senderID)) {
                        chat.reply(font.monospace(`already in the group.`));
                        return;
                }

                if (approvalMode) {
                        const botID = chat.botID();
                        const threadAdmins = adminIDs.map(admin => admin.id);
                        if (!threadAdmins.includes(botID)) {
                                chat.reply(font.monospace(`Cannot add you to the main group '${threadInfo.threadName || "Unnamed Group"}' because admin approval is required and I am not an admin there.`));
                                return;
                        }
                }

                await chat.add(event.senderID, maingcID);
                const groupName = threadInfo.threadName || "Unnamed Group";
                chat.reply(font.monospace(`Added you to the main group '${groupName}'.`));
        } catch (error) {
                chat.reply(font.monospace(`Failed to add you to the main group. Please ensure your profile settings allow message requests.`));
        }
};