const axios = require('axios');

module.exports.config = {
  name: "scrapev3",
  version: "1.1",
  role: 2,
  credits: "Markdevs69",
  info: "Simple scraper of content of a webpage and raw content.",
  usage: "[URL]",
  aliases: [],
  cd: 5
};

module.exports.run = async function ({ api, event, args }) {
  const url = args[0];

  if (!url) {
    api.sendMessage("Please provide a URL to scrape", event.threadID, event.messageID);
    return;
  }

  try {
    const response = await axios.get(url);
    let responseData = response.data;

    if (typeof responseData === 'object') {
      responseData = JSON.stringify(responseData);
    }

    api.sendMessage(`${responseData}`, event.threadID, event.messageID);
  } catch (e) {
    api.sendMessage(`${e.name}: ${e.message}`, event.threadID, event.messageID);
  }
};