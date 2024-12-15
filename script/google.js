const axios = require("axios");
const randomUseragent = require('random-useragent');

module.exports["config"] = {
  name: "google",
  aliases: ["search", "gsearch"],
  version: "1.0.0",
  credits: "Kenneth Panio",
  role: 0,
  isPrefix: false,
  type: "information",
  info: "Search for information on Google.",
  usage: "[query]",
  guide: "google Who invented the parachute?",
  cd: 6
};

module.exports["run"] = async ({ chat, args, event, font }) => {
  var mono = txt => font.monospace(txt);
  const query = args.join(" ");
  
  if (!query) {
    chat.reply(mono("Please provide a query to search!"));
    return;
  }
  
  const answering = await chat.reply(mono("🕐 | Searching..."));
  
  try {
    const response = await axios.get(`https://www.google.com/search?q=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': randomUseragent.getRandom()
      }
    });

    const snippet = extractSnippet(response.data);
    
    if (snippet) {
      const message = font.bold(`🔍 | Google Search Result for: ${query}`) + "\n\n" + snippet;
      await answering.edit(message);
    } else {
      await answering.edit(mono("No information found for the query: " + query));
    }
  } catch (error) {
    await answering.edit(mono("Failed to retrieve information. Please try again later: " + error.message));
  }
};

function extractSnippet(html) {
  const regex = /<div class="BNeawe s3v9rd AP7Wnd">(.+?)<\/div>/g;
  const matches = [];
  let match;

  while ((match = regex.exec(html)) !== null) {
    matches.push(match[1]);
  }

  // Return the first non-empty match
  return matches.length > 0 ? matches[0].replace(/<.*?>/g, '').replace(/&.*?;/g, char => {
    switch (char) {
      case '&amp;': return '&';
      case '&lt;': return '<';
      case '&gt;': return '>';
      case '&quot;': return '"';
      case '&#39;': return "'";
      default: return char;
    }
  }) : null;
}
