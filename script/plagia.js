const axios = require('axios');

module.exports["config"] = {
    name: "plagia",
    aliases: ["plagiarism", "checkplagiarism"],
    usage: "reply to a message with the text to check",
    info: "Check for plagiarism in the provided text.",
    guide: "Reply to a message containing the text with 'plagia' to check the message text.",
    type: "utility",
    credits: "Kenneth Panio",
    version: "1.0.0",
    role: 0,
};

module.exports["run"] = async ({ chat, event, font, global, args }) => {

    const checkPlagiarism = async (title, text) => {
        try {
            const response = await axios.post(
                'https://gradesfixer.com/wp-admin/admin-ajax.php',
                `action=plagiarism&type=other&title=${encodeURIComponent(title)}&text=${encodeURIComponent(text)}`,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'Accept': '*/*',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                }
            );
            return { status: true, data: response.data };
        } catch (error) {
            return { status: false, error: error.message };
        }
    };

    const title = font.origin(args.join(" ").trim());
    if (!title) {
        return chat.reply(font.monospace("Please provide a title and reply to the message containing the text you want to check for plagiarism."));
    }

    
    if (event.type !== "message_reply") {
        return chat.reply(font.monospace('Please reply to a message containing the text you want to check for plagiarism with a title.'));
    }
    
    const detecting = await chat.reply(font.monospace("Detecting Plagiarism..."));


    const replyMessage = font.origin(event.messageReply.body);
    const result = await checkPlagiarism(title, replyMessage);

    if (result.status) {
        const uniquenessMatch = result.data.match(/data-unique-match="([^"]+)"/);
        const uniquenessPercentage = uniquenessMatch ? parseFloat(uniquenessMatch[1]) : null;

        if (uniquenessPercentage === null) {
            return chat.reply(font.monospace(`Plagiarism Check Result:
                - Title: ${title}
                - Uniqueness: Data not available`));
        }

        const plagiarismPercentage = (100 - uniquenessPercentage).toFixed(2);
        const plagiarismMessage = plagiarismPercentage > 0
            ? `The text has a potential plagiarism percentage of ${plagiarismPercentage}%.`
            : `The text appears to be unique with a ${uniquenessPercentage}% uniqueness.`;

        chat.reply(font.monospace(`Plagiarism Check Result:
            - Title: ${title}
            - Uniqueness: ${uniquenessPercentage}%
            - Potential Plagiarism: ${plagiarismPercentage}%

            ${plagiarismMessage}`));
    } else {
        chat.reply(font.monospace(`An error occurred while checking for plagiarism: ${result.error}`));
    }
};