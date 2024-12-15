const axios = require('axios');

module.exports["config"] = {
    name: "aidetect",
    aliases: ["aicheck", "detectai", "zerogpt", "gptzero"],
    usage: "[text] or reply to a message containing text",
    info: "Detect if the text is AI-generated or human-written.",
    guide: "Use 'aidetect [text]' to check text directly or reply to a message with 'aidetect' to check the message text.",
    type: "artificial-intelligence",
    credits: "Kenneth Panio",
    version: "1.0.0",
    role: 0,
};

module.exports["run"] = async ({ chat, event, args, font, global }) => {

    const detectAI = async (text) => {
        try {
            const response = await axios.post(
                'https://demo.thecheckerai.com/api/detect',
                { text },
                {
                    headers: {
                        'Accept': 'application/json, text/plain, */*',
                        'Content-Type': 'application/json'
                    }
                }
            );
            return { status: true, data: response.data };
        } catch (error) {
            return { status: false, error: error.message };
        }
    };

    const getTextToAnalyze = () => {
        if (event.type === "message_reply") {
            return font.origin(event.messageReply.body);
        }
        return font.origin(args.join(' '));
    };

    const text = getTextToAnalyze().trim();
    if (!text) {
        return chat.reply(font.monospace('Please provide the text to check or reply to a message containing the text.'));
    }

    const detecting = await chat.reply(font.monospace("Detecting AI Generated Text..."));

    const result = await detectAI(text);
    
    if (result.status) {
        const { grade_level, probability_fake, probability_real, readability_score, reading_ease } = result.data;
        const fakePercentage = (probability_fake * 100).toFixed(2);
        const realPercentage = (probability_real * 100).toFixed(2);

        const certaintyMessage = fakePercentage > realPercentage
            ? `The text is ${fakePercentage}% likely to be written by an AI and ${realPercentage}% likely to be written by a human.`
            : `The text is ${realPercentage}% likely to be written by a human and ${fakePercentage}% likely to be written by an AI.`;

        chat.reply(font.monospace(`Detection result:
            - Grade Level: ${grade_level}
            - Probability Fake: ${fakePercentage}%
            - Probability Real: ${realPercentage}%
            - Readability Score: ${readability_score}
            - Reading Ease: ${reading_ease || 'N/A'}

            ${certaintyMessage}`));
    } else {
        chat.reply(font.monospace(`An error occurred while detecting the text: ${result.error}`));
    }
};