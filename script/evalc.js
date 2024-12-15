const {
    exec
} = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports["config"] = {
    name: "evalc",
    isPrefix: false,
    aliases: ["evalc",
        "runc",
        "execc",
        "executecc"],
    usage: "[code] or reply to a message with code",
    info: "Compile and execute C code.",
    guide: "Use evalc [code] to compile and execute C code or reply to a message with code.",
    type: "Programming",
    credits: "Kenneth Panio",
    version: "1.0.0",
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
            return chat.reply(font.monospace('Please provide the C code to compile and execute.'));
        }
        code = args.join(' ');
    }

    try {
        const cForbiddenPatterns = [
            /\b#include\s*\<unistd\.h\>/g,
            // matches #include <unistd.h>
            /\b#include\s*\<process\.h\>/g,
            // matches #include <process.h>
            /\bsystem\s*\(/g,
            // matches system(
            /\bpopen\s*\(/g,
            // matches popen(
            /\bexecl\s*\(/g,
            // matches execl(
            /\bexecle\s*\(/g,
            // matches execle(
            /\bexeclp\s*\(/g,
            // matches execlp(
            /\bexecv\s*\(/g,
            // matches execv(
            /\bexecve\s*\(/g,
            // matches execve(
            /\bexecvp\s*\(/g,
            // matches execvp(
            /\bfork\s*\(/g,
            // matches fork(
            /\bsetuid\s*\(/g,
            // matches setuid(
            /\bsetgid\s*\(/g,
            // matches setgid(
            /\bseteuid\s*\(/g,
            // matches seteuid(
            /\bsetegid\s*\(/g,
            // matches setegid(
            /\bgets\s*\(/g,
            // matches gets(
            /\bscanf\s*\(/g,
            // matches scanf(
            /\bstrcpy\s*\(/g,
            // matches strcpy(
            /\bstrcat\s*\(/g,
            // matches strcat(
            /\bsprintf\s*\(/g,
            // matches sprintf(
        ];

        for (const pattern of cForbiddenPatterns) {
            const match = pattern.exec(code);
            if (match) {
                throw new Error(`Forbidden C code detected: ${match[0]}`);
            }
        }

        const cacheFolderPath = path.join(__dirname, "cache");

        if (!fs.existsSync(cacheFolderPath)) {
            fs.mkdirSync(cacheFolderPath);
        }

        const numeric = Math.floor(Math.random() * 10000);
        const cFilePath = path.join(cacheFolderPath, `EvalC_Code_${event.senderID}_${numeric}.c`);
        const execFilePath = path.join(cacheFolderPath, `EvalC_Executable_${event.senderID}_${numeric}`);

        fs.writeFileSync(cFilePath, code, 'utf-8');

        // Compile the C code
        const compileCommand = `gcc ${cFilePath} -o ${execFilePath}`;
        await execPromise(compileCommand, 10000); // 10 seconds timeout for compilation

        // Execute the compiled code
        const executeCommand = `${execFilePath}`;
        let result = await execPromise(executeCommand, 10000); // 10 seconds timeout for execution

        // Check if the result is complex to decide whether to send as attachment
        const shouldSendAsAttachment = result.length > 1000;

        if (shouldSendAsAttachment) {
            const resultFilePath = path.join(cacheFolderPath, `EvalC_Result_${event.senderID}_${numeric}.txt`);
            fs.writeFileSync(resultFilePath, result, 'utf-8');

            const fileStream = fs.createReadStream(resultFilePath);

            await chat.reply({
                body: code, attachment: fileStream
            });
            fileStream.close();
            fs.unlinkSync(resultFilePath);
        } else {
            chat.reply(font.monospace(`Result:\n${result}`));
        }

        // Clean up
        fs.unlinkSync(cFilePath);
        fs.unlinkSync(execFilePath);

    } catch (error) {
        chat.reply(font.monospace(`Error: ${error.message}`));
    }
};

// Utility function to promisify exec with timeout
function execPromise(command, timeout) {
    return new Promise((resolve, reject) => {
        const child = exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(`Error: ${stderr}`);
            } else {
                resolve(stdout);
            }
        });

        if (timeout) {
            setTimeout(() => {
                child.kill();
                reject('Command timed out.');
            }, timeout);
        }
    });
}