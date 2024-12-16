const axios = require('axios');
const fs = require('fs');

module.exports["config"] = {
  name: 'scrapev2',
  version: '1.1.0',
  role: 2,
  credits: 'Modify by Markdevs69',
  info: 'Scrape data from a URL using AbstractAPI',
  usages: ['/Scrape [URL]'],
  cd: 5,
};

module.exports["run"] = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const apiKey = 'dc3fc7bc7dc540a7b1df7827fe205360';
  const url = args[0];

  if (!url) {
    api.sendMessage('Please provide a URL to scrape.', threadID, messageID);
    return;
  }

  const processingGIF = (
    await axios.get(
      'https://drive.google.com/uc?export=download&id=1Im1nktqQ59ErykI7Rg-01UpKm7E951NJ',
      { responseType: 'stream' }
    )
  ).data;

  const processingMessage = await api.sendMessage(
    {
      body: 'Processing your request. Scraping...',
      attachment: processingGIF,
    },
    threadID
  );

  try {
    const response = await axios.get(`https://scrape.abstractapi.com/v1/?api_key=${apiKey}&url=${encodeURIComponent(url)}`);
    const { status, data } = response;
    api.unsendMessage(processingMessage.messageID);

    if (status === 200) {
      const limitedResult = data.substring(0, 19000);

      const filename = 'scraped_data.txt';
      fs.writeFileSync(filename, data);

      api.sendMessage(`Here's the scraped data:\n\n${limitedResult}...\n\n𝗡𝗢𝗧𝗘: The scraped data is too long to send in a single message. The word count limit for sending messages on Facebook Messenger is 20,000 characters.\n\nTo view the full result, please download the attached txt file.`, threadID, (error, info) => {
        if (!error) {
          api.sendMessage({ attachment: fs.createReadStream(filename) }, threadID, () => fs.unlinkSync(filename));
        }
      });
    } else {
      api.sendMessage('Failed to scrape the URL. Please check the URL or try again later.', threadID, messageID);
    }
  } catch (error) {
    console.error(error);
    api.sendMessage('An error occurred while scraping the URL. Please try again later.', threadID, messageID);
  }
};