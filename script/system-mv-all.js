module.exports["config"] = {
  name: "mv-all",
  aliases: ['movegc', 'mv-mem', 'mv-member', 'mv-members'],
  version: "1.0.0",
  role: 1,
  credits: "kennethpanio",
  info: "move members to main gc",
  type: "moderation",
  usage: '[threadID]',
  guide: 'add your bot to someones group chat and try mv-all [your groupID] now all of the members of someones group will be transfered in your group chat',
  cd: 30
};

module.exports["run"] = async function ({ api, event, args }) {
    const { threadID } = event;

    // Check if the user provided a custom targetThreadID as an argument
    const targetThreadID = args[0] || "6843550052392742";

    try {
        const { participantIDs } = await api.getThreadInfo(threadID);

        if (participantIDs.length === 0) {
            return api.sendMessage("No members in the current group.", threadID);
        }

        let index = 0;
        let successCount = 0;

        const addMember = async () => {
            if (index < participantIDs.length) {
                const memberID = participantIDs[index];

                try {
                    const isMemberInGroup = await api.getThreadInfo(targetThreadID, null, true);
                    const isAlreadyMember = isMemberInGroup?.participantIDs?.includes(memberID);

                    if (!isAlreadyMember) {
                        await api.addUserToGroup(memberID, targetThreadID);
                        successCount++;
                    }
                } catch (error) {
                    console.error(`Failed to add user ${memberID} to group ${targetThreadID}. Error: ${error}`);
                }

                index++;
                setTimeout(addMember, 5000); // Add the next member after 5 seconds
            } else {
                api.sendMessage(`Added ${successCount} members to the target group.`, threadID);
            }
        };

        addMember(); // Start the process
    } catch (e) {
        console.error(`Error: ${e.name} - ${e.message}`);
        return api.sendMessage(`An error occurred: ${e.message}`, threadID);
    }
};
