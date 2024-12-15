const fs = require('fs');
const path = require('path');

module.exports["config"] = {
  name: "analyze",
  isPrefix: false,
  aliases: ["count", "stats", "analyze", "countword", "countparagraph", "countsentence", "countw"],
  usage: "[text] or reply to a message with text",
  info: "Analyze the given text and provide statistics such as word count, paragraph count, and character count.",
  guide: "Use analyze [text] to analyze the text or reply to a message with text.",
  type: "Utility",
  credits: "Kenneth Panio",
  version: "1.0.0",
  role: 0,
};

module.exports["run"] = async ({ api, event, args, chat, font, admin, prefix, blacklist, Utils, Currencies, Experience, global }) => {
  let text;

  if (event.type === "message_reply" && event.messageReply.body) {
    text = event.messageReply.body;
  } else {
    if (args.length === 0) {
      return chat.reply(font.monospace('Please provide the text to analyze.'));
    }
    text = args.join(' ');
  }

  try {
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    const paragraphCount = text.split(/\n+/).filter(paragraph => paragraph.trim().length > 0).length;
    const characterCount = text.length;
    const nonWhitespaceCharacterCount = text.replace(/\s/g, '').length;
    const sentenceCount = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length;

    const analysis = {
      words: wordCount,
      paragraphs: paragraphCount,
      characters: characterCount,
      nonWhitespaceCharacters: nonWhitespaceCharacterCount,
      sentences: sentenceCount
    };

    const responseText = `
      Analysis:
      Words: ${wordCount}
      Paragraphs: ${paragraphCount}
      Characters: ${characterCount}
      Non-whitespace characters: ${nonWhitespaceCharacterCount}
      Sentences: ${sentenceCount}
    `;

    chat.reply(font.monospace(responseText.trim()));
  } catch (error) {
    chat.reply(font.monospace(`Error: ${error.message}`));
  }
};
