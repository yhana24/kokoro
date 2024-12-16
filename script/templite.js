module.exports["config"] = {
  name: "temp-lite",
  version: "1.0.0",
  role: 0,
  credits: "shiki",
  info: "Get temp mail lite version",
  type: "Accounting",
  usage: "[new/list/more]",
  cd: 2,
  dependencies: {"axios": ""}
};

module.exports["run"] = async ({ api, event, args }) => {
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

    return api.sendMessage(`» Mail Name: ${user}\n» Host: ${host}\n» Mail ${user}@${host} (.)com\n» Time: ${time}\n» Server Time: ${serverTime}\n» Key: ${keyMail}\n» Remaining Time: ${leftTime}s\n» Mail ID: ${mailId}\n» Content: ${subject}\n» Date: ${date}`, event.threadID, event.messageID);
  } else if (args[0] == "list") {
    const res = await axios.get(`https://www.phamvandienofficial.xyz/mail10p/domain`);
    const domainList = res.data.domain;

    return api.sendMessage(`List of Domains: \n${domainList}`, event.threadID, event.messageID);
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

    return api.sendMessage(`» Mail Name: ${user}\n» Host: ${host}\n» Mail ${user}@${host} (.)com\n» Time: ${time}\n» Server Time: ${serverTime}\n» Key: ${keyMail}\n» Remaining Time: ${leftTime}s\n» Mail ID: ${mailId}\n» Content: ${subject}\n» Date: ${date}`, event.threadID, event.messageID);
  } else if (args[0] == "get") {
    const res = await axios.get(`https://10minutemail.net/address.api.php`);
    const mail = res.data.mail_get_mail;
    const id = res.data.session_id;
    const url = res.data.permalink.url;
    const keyMail = res.data.permalink.key;
    const formattedUrl = url.replace(/\./g, ' . ');
    const formattedMail = mail.replace(/\./g, ' . ');

    return api.sendMessage(`» Email: ${formattedMail}\n» Mail ID: ${id}\n» Mail URL: ${formattedUrl}\n» Key Mail: ${keyMail}`, event.threadID, event.messageID);
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

    return api.sendMessage(`» Email: ${formattedEmail}\n» Mail ID: ${id}\n» From: ${formattedFrom}\n» Subject: ${subject}\n» Time: ${time}`, event.threadID, event.messageID);
  } else if (args.join() == "") {
    return api.sendMessage(`NEW - Create a new mail\n
CHECK - Check the inbox\n
GET - Get the current mail\n
LIST - View mail list\n
MORE - Add a new mail\n
-------------------------\n\n
You can click on the mail URL and enter the Key Mail to view the content of the mail.`, event.threadID, event.messageID);
  }
      }