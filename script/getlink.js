const axios = require("axios");

module.exports["config"] = {
  name: "getlink",
  isPrefix: false,
  version: "1.0.0",
  role: 0,
  credits: "Kenneth Panio",
  info: "Get the HD link of a Facebook video or attachment you replied with",
  usage: "[fb reels video url] or reply to attachment",
  guide: "Provide a Facebook post video URL or reply to a message with an attachment",
  cd: 0,
};

module.exports["run"] = async ({ chat, event, args, font }) => {
  try {
    if (args.length > 0) {
      const videoUrl = args[0];
      const videoDetails = await fetchVideoDetails(videoUrl);

      let replyMessage = `Title: ${videoDetails.title || "Unknown or No Title"}\n`;
      if (videoDetails.hd) {
        replyMessage += `HD Link: ${videoDetails.hd}\n`;
      }
      if (videoDetails.sd) {
        replyMessage += `SD Link: ${videoDetails.sd}\n`;
      }
      chat.reply(replyMessage);
    } else if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments.length > 0) {
      // Case 2: Replying to a message with an attachment
      const attachments = event.messageReply.attachments;
      const attachmentLinks = attachments.map(attachment => attachment.url);

      chat.reply(attachmentLinks.join('\n\n'));
      chat.log('Attachment links retrieved.');
    } else {
      chat.reply(font.monospace('Please provide a reels url or reply to a message with an attachment.'));
    }
  } catch (error) {
    chat.error("Error occurred: " + error.message);
    return chat.reply(font.monospace("An error occurred while processing your request."));
  }
};

async function fetchVideoDetails(url) {
  // Regex pattern to validate Facebook video URLs
  const validFacebookVideoUrlRegex = /https:\/\/www\.facebook\.com\/(?:watch\/?\?v=\d+|(?:\S+\/videos\/\d+)|(?:reel\/\d+)|(?:share\/\S+))(?:\?\S+)?/;

  // Validate URL against the regex pattern
  if (!validFacebookVideoUrlRegex.test(url)) {
    throw new Error("Please provide a valid Facebook video URL");
  }

  const headers = {
    "sec-fetch-user": "?1",
    "sec-ch-ua-mobile": "?0",
    "sec-fetch-site": "none",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "cache-control": "max-age=0",
    authority: "www.facebook.com",
    "upgrade-insecure-requests": "1",
    "accept-language": "en-GB,en;q=0.9,tr-TR;q=0.8,tr;q=0.7,en-US;q=0.6",
    "sec-ch-ua": '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36",
    accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    cookie: "sb=Rn8BYQvCEb2fpMQZjsd6L382; datr=Rn8BYbyhXgw9RlOvmsosmVNT; c_user=100003164630629; _fbp=fb.1.1629876126997.444699739; wd=1920x939; spin=r.1004812505_b.trunk_t.1638730393_s.1_v.2_; xs=28%3A8ROnP0aeVF8XcQ%3A2%3A1627488145%3A-1%3A4916%3A%3AAcWIuSjPy2mlTPuZAeA2wWzHzEDuumXI89jH8a_QIV8; fr=0jQw7hcrFdas2ZeyT.AWVpRNl_4noCEs_hb8kaZahs-jA.BhrQqa.3E.AAA.0.0.BhrQqa.AWUu879ZtCw",
  };

  const parseString = (string) => JSON.parse(`{"text": "${string}"}`).text;

  return new Promise((resolve, reject) => {
    axios.get(url, { headers }).then(({ data }) => {
      data = data.replace(/&quot;/g, '"').replace(/&amp;/g, "&");

      const sdMatch = data.match(/"browser_native_sd_url":"(.*?)"/) || data.match(/"playable_url":"(.*?)"/) || data.match(/sd_src\s*:\s*"([^"]*)"/) || data.match(/(?<="src":")[^"]*(https:\/\/[^"]*)/);
      const hdMatch = data.match(/"browser_native_hd_url":"(.*?)"/) || data.match(/"playable_url_quality_hd":"(.*?)"/) || data.match(/hd_src\s*:\s*"([^"]*)"/);
      const titleMatch = data.match(/<meta\sname="description"\scontent="(.*?)"/);
      const thumbMatch = data.match(/"preferred_thumbnail":{"image":{"uri":"(.*?)"/);

      if (sdMatch && sdMatch[1]) {
        const result = {
          title: titleMatch && titleMatch[1] ? parseString(titleMatch[1]) : data.match(/<title>(.*?)<\/title>/)?.[1] ?? "",
          sd: parseString(sdMatch[1]),
          hd: hdMatch && hdMatch[1] ? parseString(hdMatch[1]) : "",
          thumbnail: thumbMatch && thumbMatch[1] ? parseString(thumbMatch[1]) : "",
        };

        resolve(result);
      } else {
        reject("Unable to fetch video information at this time. Please try again");
      }
    }).catch(error => {
      reject("Unable to fetch video information at this time. Please try again");
    });
  });
}
