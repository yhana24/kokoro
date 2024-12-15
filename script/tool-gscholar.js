const axios = require('axios');
const scholarly = require('scholarly');

module.exports["config"] = {
  name: "scholarly",
  aliases: ["gscholar", "article", "articles"],
  version: "1.0.0",
  info: "Search Google Scholar for articles on a specific topic",
  credits: "Kenneth Panio",
  type: "info",
  role: 0,
  usage: '[Title of Research]',
  guide: 'scholarly Exploring the Link Between Social Media Usage and Anxiety in Young Adults\n\nResults: Gives you 5 results with these information: Title,Author,Year,Url',
  usage: "[topic]"
};

module.exports["run"] = async function ({ api, event, args, font }) {
        const topic = args.join(' ');
  try {
    if (!topic) {
      return api.sendMessage("Please provide a topic to search on Scholarly.", event.threadID);
    }

    const searchResults = await scholarly.search(topic);
    const limitedResults = searchResults.slice(0, 5);

    let messageText = '';
    limitedResults.forEach((article, index) => {
      messageText += `${index + 1}. 📚  ${font.bold(article.title)}\n👥  Authors: ${article.authors.join(', ')}\n📅 Year: ${article.year}\n🔗 URL: ${article.url}\n\n`;
    });
    api.sendMessage(messageText, event.threadID);
  } catch (error) {
    api.sendMessage(error.message, event.threadID);
  }
};
