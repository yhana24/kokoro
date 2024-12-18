module.exports["config"] = {
  name: 'dream',
  version: '1.1.2',
  role: 0,
  credits: "cliff",
  info: 'dreamforth',
  commandCategory: 'AI',
  usage: '[prompt]',
  cd: 0,
};

module.exports.run = async function({ api, event, args }) {
  const axios = require('axios');
  let user = args.join(' ');

  try {
    if (!user) {
      const messageInfo = await new Promise(resolve => {
        api.sendMessage('Please provide a dream first!', event.threadID, (err, info) => {
          resolve(info);
        });
      });
      setTimeout(() => {
        api.unsendMessage(messageInfo.messageID);
      }, 5000);
      return;
    }

    const initialMessage = await new Promise(resolve => { 
      api.sendMessage(`֎ | Finding a dream related to: ${user}`, event.threadID, (err, info1) => {
        resolve(info1);
      }, event.messageID);
    });

    const response = await axios.get(`https://betadash-api-swordslush.vercel.app/dreamforth?title=${encodeURIComponent(user)}&page=1`);

    const responseData = response.data.data;

    let formattedResponse = '';
    responseData.forEach((item, index) => {
      formattedResponse += `[ ${index + 1} ].\n`;
      formattedResponse += `𝗧𝗶𝘁𝗹𝗲: "${item.title}"\n`;
      formattedResponse += `𝗟𝗶𝗻𝗸: "${item.link}"\n`;
      formattedResponse += `𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻:\n${item.description}\n\n`;
    });

    api.editMessage(formattedResponse, initialMessage.messageID);

  } catch (err) {
    const errorMsg = await new Promise(resolve => {
      api.sendMessage('Error: Could not retrieve the dream details. Please try again later.', event.threadID, (err, info) => {
        resolve(info);
      });
    });

    setTimeout(() => {
      api.unsendMessage(errorMsg.messageID);
    }, 10000);
  }
};
