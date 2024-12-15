module.exports["config"] = {
  name: "10minutemail",
  alias: ["10mail"],
  version: "1.0.0",
  role: 0,
  credits: "shiki",
  info: "Get random 10minutemail or create and check inbox",
  type: "Accounting",
  usage: "[new/list/more]",
  dependencies: {"axios": ""}
};

module.exports["run"] = async function ({ api, event, args, chat }) {
  const axios = require('axios');
  
  if (args[0] == "new") {
    const res = await axios.get(`https://10minutemail.net/address.api.php?new=1`);
    const user = res.data.mail_get_user;
    const host = res.data.mail_get_host;
    const time = res.data.mail_get_time;
    const serverTime = res.data.mail_server_time;
    const keyMail = res.data.mail_get_key;
    const leftTime = res.data.mail_left_time;
    const mailId = res.data.mail_list[0].mail_id;
    const subject = res.data.mail_list[0].subject;
    const date = res.data.mail_list[0].datetime2;
    
    return chat.reply(`» Mail Name: ${user}\n» Host: ${host}\n» Mail ${user}@${host} (.)com\n» Time: ${time}\n» Server Time: ${serverTime}\n» Key: ${keyMail}\n» Remaining Time: ${leftTime}s\n» Mail ID: ${mailId}\n» Content: ${subject}\n» Date: ${date}`);
    chat.react("😱");
  } else if (args[0] == "list") {
    const res = await axios.get(`https://www.phamvandienofficial.xyz/mail10p/domain`);
    const domainList = res.data.domain;
    
    return chat.reply(`List of Domains: \n${domainList}`);
    chat.react("⛩️");
  } else if (args[0] == "more") {
    const res = await axios.get(`https://10minutemail.net/address.api.php?more=1`);
    const user = res.data.mail_get_user;
    const host = res.data.mail_get_host;
    const time = res.data.mail_get_time;
    const serverTime = res.data.mail_server_time;
    const keyMail = res.data.mail_get_key;
    const leftTime = res.data.mail_left_time;
    const mailId = res.data.mail_list[0].mail_id;
    const subject = res.data.mail_list[0].subject;
    const date = res.data.mail_list[0].datetime2;
    
    return chat.reply(`» Mail Name: ${user}\n» Host: ${host}\n» Mail ${user}@${host} (.)com\n» Time: ${time}\n» Server Time: ${serverTime}\n» Key: ${keyMail}\n» Remaining Time: ${leftTime}s\n» Mail ID: ${mailId}\n» Content: ${subject}\n» Date: ${date}`);
    chat.react("🗿");
  } else if (args[0] == "get") {
    const res = await axios.get(`https://10minutemail.net/address.api.php`);
    const mail = res.data.mail_get_mail;
    const id = res.data.session_id;
    const url = res.data.permalink.url;
    const keyMail = res.data.permalink.key;
    const formattedUrl = url.replace(/\./g, ' . ');
    const formattedMail = mail.replace(/\./g, ' . ');
    
    return chat.reply(`» Email: ${formattedMail}\n» Mail ID: ${id}\n» Mail URL: ${formattedUrl}\n» Key Mail: ${keyMail}`);
    chat.react("🏀");
  } else if (args[0] == "check") {
    const res = await axios.get(`https://10minutemail.net/address.api.php`);
    const data = res.data.mail_list[0];
    const email = res.data.mail_get_mail;
    const id = data.mail_id;
    const from = data.from;
    const subject = data.subject;
    const time = data.datetime2;
    const formattedFrom = from.replace(/\./g, ' . ');
    const formattedEmail = email.replace(/\./g, ' . ');
    
    return chat.reply(`» Email: ${formattedEmail}\n» Mail ID: ${id}\n» From: ${formattedFrom}\n» Subject: ${subject}\n» Time: ${time}`);
    chat.react("🤷");
  } else if (args.join() == "") {
    return chat.reply(`NEW - Create a new mail\n
CHECK - Check the inbox\n
GET - Get the current mail\n
LIST - View mail list\n
MORE - Add a new mail\n
-------------------------\n\n
You can click on the mail URL and enter the Key Mail to view the content of the mail.`);
chat.react("😶");
  }
      }
  
