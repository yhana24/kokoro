const {
    PythonShell
} = require('python-shell');
const fs = require('fs');
const path = require('path');

module.exports["config"] = {
    name: "evalpy",
    isPrefix: false,
    aliases: ["evalpython",
        "runpy",
        "execpy",
        "executepy"],
    usage: "[code] or reply to a message with code",
    info: "Evaluate and execute Python code.",
    guide: "Use evalpython [code] to execute Python code or reply to a message with code.",
    type: "Programming",
    credits: "Kenneth Panio",
    version: "1.3.0",
    role: 0,
};

module.exports["run"] = async ({
    event, args, chat, font
}) => {
    let code;

    if (event.type === "message_reply" && event.messageReply.body && event.messageReply.attachments) {
        code = event.messageReply.body;
    } else {
        if (args.length === 0) {
            return chat.reply(font.monospace('Please provide the Python code to evaluate.'));
        }
        code = args.join(' ');
    }

    try {
        const forbiddenPatterns = [
            /import\s+os/,
            /import\s+sys/,
            /subprocess\.run/,
            /subprocess\.call/,
            /subprocess\.Popen/,
            /eval\s*\(/,
            /exec\s*\(/,
            /os\./,
            /sys\./,
            /exit\s*\(/,
            /quit\s*\(/,
            /raise\s+SystemExit/,
        ];

        for (const pattern of forbiddenPatterns) {
            const match = pattern.exec(code);
            if (match) {
                throw new Error(`Forbidden Python code detected: ${match[0]}`);
            }
        }

        const options = {
            mode: 'text',
            pythonPath: 'python3',
            // Replace with your Python interpreter path if necessary
            pythonOptions: ['-u'],
            // get print results in real-time
            timeout: 10000,
            // Timeout in milliseconds (10 seconds)
        };

        let result = await PythonShell.runString(code, options);

        // Check if the result is complex to decide whether to send as attachment
        const shouldSendAsAttachment = JSON.stringify(result).length > 1000;


        if (shouldSendAsAttachment) {
            const cacheFolderPath = path.join(__dirname, "cache");

            if (!fs.existsSync(cacheFolderPath)) {
                fs.mkdirSync(cacheFolderPath);
            }

            const numeric = Math.floor(Math.random() * 10000);
            const filePath = path.join(
                cacheFolderPath,
                `EvalPy_Result_${event.senderID}_${numeric}.json`
            );
            fs.writeFileSync(filePath, JSON.stringify(result, null, 2), 'utf-8');

            const fileStream = fs.createReadStream(filePath);

            await chat.reply({
                body: code, attachment: fileStream
            });
            fileStream.close();
            fs.unlinkSync(filePath);
        } else {
            const responseText = [];
            responseText.push(`Result:\n${result}`);

            chat.reply(font.monospace(responseText.join('\n\n')));
        }
    } catch (error) {
        chat.reply(font.monospace(`Error: ${error.message}`));
    }
};