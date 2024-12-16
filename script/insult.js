const axios = require('axios');
module.exports.config = {
  name: "insult",
  version: "1.0.0",
  role: 2,
  info: "Get a random insult.",
  usage: "",
  credits: "Developer",
  cd: 0
};
module.exports.run = async function ({
  api,
  event
}) {
  const {
    threadID,
    messageID
  } = event;
  try {
    const response = await axios.get('https://evilinsult.com/generate_insult.php?lang=en&type=json');
    const insult = response.data.insult;
    api.sendMessage(`Here's a random insult for you: ${insult}`, threadID);
  } catch (error) {
    api.sendMessage("Sorry, I couldn't fetch an insult at the moment. Please try again later.", threadID, messageID);
  }
};