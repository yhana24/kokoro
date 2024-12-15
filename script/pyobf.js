const fs = require('fs');
const path = require('path');

module.exports["config"] = {
    name: "pyobf",
    aliases: ["obfpy", "pyobfuscate"],
    usage: "[name] [repeatition count] [code] or <reply to message contains code>",
    info: "Obfuscate Python code by encoding it and constructing obfuscated strings.",
    guide: "Use pyobf [name] [repeatition count] [code] or reply message that contains python code.",
    type: "Programming",
    credits: "Kenneth Panio",
    version: "1.0.0",
    role: 0
};

module.exports["run"] = async ({ event, args, chat, font }) => {

    const variableName = args[0] || "AtomicSlashStudio";
    const repetitions = parseInt(args[1]) || 50;
  
    let code;
    if (event.type === "message_reply" && event.messageReply.body) {
        code = event.messageReply.body;
    } else {
        code = args.slice(2).join(" ");
        if (!code) {
            return chat.reply(font.monospace("Please provide [name] [repeatition count] [code] or reply to message contains python code"));
        }
    }

    try {
        const encodedCode = Buffer.from(code).toString('base64');
        let obfuscatedCode = `${variableName.repeat(repetitions)} = "";\n`;

        for (let i = 0; i < repetitions; i++) {
            let index = 0;
            for (let j = 0; j < Math.ceil(encodedCode.length / 2); j++) {
                let _str = '';
                for (let k = index; k < index + 2 && k < encodedCode.length; k++) {
                    let byte = encodedCode.charCodeAt(k).toString(16);
                    if (byte.length < 2) {
                        byte = '0' + byte;
                    }
                    _str += '\\x' + byte;
                }
                obfuscatedCode += `${variableName.repeat(repetitions)} += "${_str}";\n`;
                index += 2;
            }
        }

        obfuscatedCode += `exec(__import__("base64").b64decode(${variableName.repeat(repetitions)}.encode("utf-8")).decode("utf-8"))`;

        const cacheFolderPath = path.join(__dirname, "cache");
        if (!fs.existsSync(cacheFolderPath)) {
            fs.mkdirSync(cacheFolderPath);
        }

        const numeric = Math.floor(Math.random() * 10000);
        const filePath = path.join(cacheFolderPath, `Obfuscated_${numeric}.py`);
        fs.writeFileSync(filePath, `# Encrypted By Kenneth Panio\n\n${obfuscatedCode}`, "utf-8");

        const fileStream = fs.createReadStream(filePath);
        await chat.reply({ attachment: fileStream });

        fs.unlinkSync(filePath);
    } catch (error) {
        chat.reply(font.monospace(`Can't send attachment bot is temporary restricted from using this feature.`));
    }
};
