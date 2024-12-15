const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

module.exports["config"] = {
  name: "ngl",
  aliases: ["nglspam", "spamngl", "nglbomb"],
  version: "1.0.0",
  credits: "Kim Joseph DG Bien",
  info: "Send anonymous ngl",
  type: "message",
  guide: "ngl ngluser123 fuck you - 30",
  cd: 10,
  usage: "[username or link] [message] - [amount]",
};

module.exports["run"] = async ({ chat, args, prefix }) => {
  if (args.length < 2) {
    return chat.reply("Invalid command format. Please use " + prefix + "ngl [username or link] [message] - [amount]");
  }

  let nglusername = args[0];
  const separatorIndex = args.indexOf("-");

  const linkRegex = /(?:https?:\/\/)?(?:www\.)?ngl\.link\/([a-zA-Z0-9_-]+)/;
  const match = nglusername.match(linkRegex);
  if (match) {
    nglusername = match[1];
  }

  let message, amount;
  if (separatorIndex !== -1) {
    message = args.slice(1, separatorIndex).join(" ");
    amount = parseInt(args[separatorIndex + 1]);
  } else {
    message = args.slice(1).join(" ");
  }

  // Check if amount is provided and within range
  if (amount && (isNaN(amount) || amount <= 0 || amount > 10)) {
    return chat.reply("You can't send anonymous message more than 10.");
  }

  // Set default amount to 50 if not provided
  amount = amount || 1;

  // Check if username and message are valid
  if (!nglusername || !message) {
    return chat.reply("Invalid command format. Please use " + prefix + "ngl [username or link] [message] - [amount]");
  }

  try {
    let value = 0;
    for (let i = 0; i < amount; i++) {
      const deviceId = uuidv4(); // Generate random deviceId
      const headers = {
        'referer': `https://ngl.link/${nglusername}`,
        'accept-language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
      };

      const data = {
        'username': nglusername,
        'question': message,
        'deviceId': deviceId,
        'gameSlug': '',
        'referrer': '',
      };

      await axios.post('https://ngl.link/api/submit', data, { headers });
      value++;
      chat.log(`[+] Send => ${value}`);
    }

    chat.reply(`Successfully sent ${amount} message(s) to ${nglusername} through ngl.link.`);
  } catch (error) {
    chat.reply("An error occurred while sending the message through ngl.link: " + error.message);
  }
};
