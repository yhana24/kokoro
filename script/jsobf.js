const JavaScriptObfuscator = require("javascript-obfuscator");
const fs = require('fs');
const path = require('path');

module.exports["config"] = {
  name: "obfuscate",
  aliases: ["obf", "jsobf"],
  usage: "[code] or reply to a message with code",
  info: "Obfuscate JavaScript code using a JavaScript obfuscation library.",
  guide: "Use obfuscate [code] to obfuscate JavaScript code or reply to a message with code.",
  type: "Programming",
  credits: "Kenneth Panio",
  version: "1.0.0",
  role: 0
};

module.exports["run"] = async ({ event, args, chat, font }) => {
  let code;

  if (event.type === "message_reply" && event.messageReply.body) {
    code = event.messageReply.body;
  } else {
    if (args.length === 0) {
      return chat.reply(
        font.monospace(
          "Please provide the JavaScript code to obfuscate."
        )
      );
    }
    code = args.join(" ");
  }

  try {
    const obfuscatedCode = JavaScriptObfuscator.obfuscate(code, {
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 0.5, // Reduced from 0.8
      deadCodeInjection: false, // Disabled to improve performance
      debugProtection: false, // Disabled to improve performance
      disableConsoleOutput: false,
      identifierNamesGenerator: "hexadecimal",
      log: false,
      numbersToExpressions: false, // Disabled to improve performance
      renameGlobals: false, // Disabled to improve performance
      selfDefending: true,
      simplify: true,
      splitStrings: false,
      stringArray: true,
      stringArrayCallsWrapper: false, // Disabled to improve performance
      stringArrayEncoding: ["rc4", "base64"],
      stringArrayThreshold: 0.5, // Reduced from 0.8
      stringArrayIndexShift: false, // Disabled to improve performance
      stringArrayRotate: true,
      stringArrayShuffle: true,
      stringArrayWrappersCount: 1,
      stringArrayWrappersChainedCalls: false, // Disabled to improve performance
      stringArrayWrappersParametersMaxCount: 2, // Reduced max count
      unicodeEscapeSequence: true
    }).getObfuscatedCode();



    const cacheFolderPath = path.join(__dirname, "cache");

    if (!fs.existsSync(cacheFolderPath)) {
      fs.mkdirSync(cacheFolderPath);
    }

    const numeric = Math.floor(Math.random() * 10000);
    const filePath = path.join(
      cacheFolderPath,
      `Obfuscated_${event.senderID}_${numeric}.txt`
    );
    fs.writeFileSync(filePath, "// Encrypted By Kenneth Panio\n\n" + obfuscatedCode, "utf-8");

    const fileStream = fs.createReadStream(filePath);

    await chat.reply({ attachment: fileStream });
    fileStream.close();
    fs.unlinkSync(filePath);
  } catch (error) {
    chat.reply(font.monospace(`Can't send attachment bot is temporary restricted from using this feature.`));
  }
};
