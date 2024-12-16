const axios = require('axios');
const { TempMail } = require("1secmail-api");

module.exports["config"] = {
  name: "tempmailv2",
  version: "1.0.1",
  info: "Generates random email from www.1secmail.com and fetches message from inbox",
  credits: "Kenneth Panio",
  type: "Accounting",
  role: 0,
  aliases: [],
  usage: "[count (optional)] or inbox [email] [message limit to show (optional)]"
};

const TEMP_MAIL_URL = 'https://www.1secmail.com/api/v1/';
const MAX_EMAIL_COUNT = 10;
const DEFAULT_DISPLAY_LIMIT = 5;

function generateRandomId() {
  var length = 6;
  var characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  var randomId = '';

  for (var i = 0; i < length; i++) {
    randomId += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return randomId;
}

module.exports["run"] = async function ({ api, event, args, chat }) {
  try {
    if (args[0] === 'inbox') {
      if (!args[1]) {
        return chat.reply("Please provide an email address for the inbox.");
      }

      const [username, domain] = args[1].replace(/\(\.\)/g, '.').split('@');
      const inboxResponse = await axios.get(`${TEMP_MAIL_URL}?action=getMessages&login=${username}&domain=${domain}`);
      const messages = inboxResponse.data;

      if (!messages || messages.length === 0) {
        return chat.replyID(`No messages found for ${args[1]}.`);
      }

      const displayLimit = args[2] || DEFAULT_DISPLAY_LIMIT;
      const limitedMessages = messages.slice(0, displayLimit);

      let messageText = '';
      for (const message of limitedMessages) {
        const messageDetails = await axios.get(`${TEMP_MAIL_URL}?action=readMessage&login=${username}&domain=${domain}&id=${message.id}`);
        const detailedMessage = messageDetails.data;
        const attachments = detailedMessage.attachments.map(attachment => `📎 Attachment: ${attachment.filename} (${attachment.size} bytes)`).join('\n');

        messageText += `👤 𝗦𝗘𝗡𝗗𝗘𝗥: ${detailedMessage.from}\n🎯 𝗦𝗨𝗕𝗝𝗘𝗖𝗧: ${detailedMessage.subject || 'No Subject 🎯'}\n📅 𝗗𝗔𝗧𝗘: ${detailedMessage.date}\n\n${detailedMessage.textBody || detailedMessage.body}\n\n${attachments}\n\n`;
      }

      chat.reply(`Successful! Displaying the latest ${displayLimit} Inbox 📥.`);
      chat.reply(messageText);
      chat.react("📮");
    } else {
      const count = Math.min(args[0] || 1, MAX_EMAIL_COUNT);
      if (count > MAX_EMAIL_COUNT) return chat.reply(`Maximum allowed count is ${MAX_EMAIL_COUNT}.`);
      const generatedEmails = (await axios.get(`${TEMP_MAIL_URL}?action=genRandomMailbox&count=${count}`)).data.map(email => `${email.replace(/\./g, '(.)')}`).join('\n');
      const mail = new TempMail(generateRandomId());
      chat.reply(generatedEmails);
      chat.reply(`Extra: ${mail.address}`);
    }
  } catch (error) {
    chat.react("⚠️");
    console.error('Error:', error);
    chat.reply("Failed to generate or retrieve email, please try again.");
  }
};