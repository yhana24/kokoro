module.exports["config"] = {
    name: "filter",
    isPrefix: false,
    info: "Removes users whose names couldn't be retrieved from the current thread",
    version: "1.0.0",
    role: 0,
    cd: 15,
    type: "moderation"
};

module.exports["run"] = async ({ chat, event, font }) => {
    var mono = txt => font.monospace(txt);
    const threadInfo = await chat.threadInfo(event.threadID);
    const adminIDs = threadInfo.adminIDs.map(admin => admin.id);
    
    const isAdmin = adminIDs?.includes(chat.botID());
    
    if (!isAdmin) {
        chat.reply(mono("I'm not an admin, so I can't filter users! You need to make me an admin of the group first."));
        return;
    }

    const users = threadInfo.userInfo;
    let successCount = 0, failCount = 0, usersToFilter = [];

    for (const user of users) {
        if (user.gender === undefined) {
            usersToFilter.push(user.id);
        }
    }

    if (usersToFilter.length === 0) {
        chat.reply(mono("There are no Facebook user(s)."));
    } else {
        chat.reply(mono(`Found ${usersToFilter.length} Facebook User(s).`));
        chat.reply(mono("Starting filtering..."));
        
        for (const userID of usersToFilter) {
            try {
                await new Promise(resolve => setTimeout(resolve, 1000));
                await chat.kick(parseInt(userID)); 
                successCount++;
            } catch (error) {
                failCount++;
            }
        }

        chat.reply(mono(`Successfully filtered ${successCount} user(s).`));
        
        if (failCount !== 0) {
            chat.reply(mono(`Failed to filter ${failCount} user(s).`));
        }
    }
};
