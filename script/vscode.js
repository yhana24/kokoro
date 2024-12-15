const fs = require('fs');
const path = require('path');
/const { transpileModule } = require('typescript');*/

module.exports["config"] = {
  name: "vscode",
  aliases: ["edit", "modify"],
  usage: "[directory/file] [new code] or [directory/file] to inspect code",
  info: "Edit an existing file with new code or inspect code if only directory provided.",
  guide: "vscode [directory/file] [new code] or [directory/file] to inspect code. to modify the code just reply to message with contains updated code, example: vscode [directory/file] > message.body contains code.",
  type: "maintenance",
  credits: "Kenneth Panio",
  version: "1.4.0",
  role: 3,
};

module.exports["run"] = async ({ chat, event, args, font }) => {
    
  if (args.length === 0) {
    return chat.reply(font.monospace(`Usage: ${module.exports["config"].usage}\n\nInfo: ${module.exports["config"].info}\n\nGuide: ${module.exports["config"].guide}`));
  }

  const filePath = args[0];
  const absolutePath = path.resolve(filePath);

  if (event.type === "message_reply") {
    const repliedMessage = event.messageReply.body;

    if (!repliedMessage.trim()) {
      return chat.reply(font.monospace('No code provided for update.'));
    }

    writeFile(chat, absolutePath, repliedMessage, font);
  } else {
    if (args.length === 1) {
      fs.readFile(absolutePath, "utf-8", function (err, data) {
        if (err) {
          return chat.reply(font.monospace(`An error occurred while reading the file: ${err.message}`));
        } else {
          return chat.reply(data);
        }
      });
    } else {
      const snippet = args.slice(1).join(' ');

      if (!snippet.trim()) {
        return chat.reply(font.monospace('No code provided for update.'));
      }

      writeFile(chat, absolutePath, snippet, font);
    }
  }
};

function writeFile(chat, filePath, snippet, font) {
  const fileExtension = path.extname(filePath)?.toLowerCase();

  if (fileExtension === '.js'/* || fileExtension === '.ts'*/) {
    try {
      if (fileExtension === '.js') {
      /*  eval(snippet);*/
      snippet;
      } /*else if (fileExtension === '.ts') {
        transpileModule(snippet, {});
      }*/
    } catch (error) {
      return chat.reply(font.monospace(`Syntax error detected in the provided code: ${error.message}`));
    }
  }

  fs.writeFile(filePath, snippet, "utf-8", function (err) {
    if (err) {
      return chat.reply(font.monospace(`An error occurred while updating the file: ${err.message}`));
    } else {
      return chat.reply(font.monospace(`File ${filePath} successfully updated.`));
    }
  });
}
