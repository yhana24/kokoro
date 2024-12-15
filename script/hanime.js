const axios = require("axios");
const randomUserAgent = require("random-useragent");

module.exports["config"] = {
  name: "hanime",
  version: "2.5.0",
  credits: "Kenneth Panio",
  info: "Search and watch hanime video.",
  usage: "[sauces or name, title]",
  type: "nsfw",
  role: 0,
  cd: 6,
};

module.exports["run"] = async ({ chat, args, event, Utils, font, global }) => {
  const mono = txt => font.monospace(txt);
  const { senderID } = event;

  if (!Utils.handleReply) {
    Utils.handleReply = [];
  }

  let handleReply = Utils.handleReply.find(reply => reply.author === senderID);

  if (!handleReply) {
    handleReply = {
      type: "select_hanime",
      page: 0,
      hits: [],
      author: senderID,
      sentMessages: [] 
    };
    Utils.handleReply.push(handleReply);
  }

  if (!args[0] && handleReply.hits.length === 0) {

    const seed = Math.floor(Math.random() * 9999999999999);
    try {
      const response = await axios.get(global.api["hanime"][0] + `?source=randomize&r=${seed}`);
      handleReply.hits = response.data.hentai_videos;
      handleReply.page = 0;
    } catch (error) {
      await chat.reply(mono(error.message));
      return;
    }
  } else if (args[0]) {
    const searchQuery = args.join(" ");
    try {
      const response = await axios.post(global.api["hanime"][1],
        {
          search_text: searchQuery,
          tags: [],
          tags_mode: 'AND',
          brands: [],
          blacklist: [],
          order_by: 'created_at_unix',
          ordering: 'desc',
          page: 0
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data || !response.data.hits || response.data.hits.length === 0) {
        await chat.reply(mono("No results found for your query."));
        return;
      }

      handleReply.hits = JSON.parse(response.data.hits);
      handleReply.page = 0;
    } catch (error) {
      await chat.reply(mono(error.message));
      return;
    }
  }

  const resultsPerPage = 5;
  const totalPages = Math.ceil(handleReply.hits.length / resultsPerPage);
  const startIndex = handleReply.page * resultsPerPage;
  const endIndex = Math.min(startIndex + resultsPerPage, handleReply.hits.length);

  let replyMessage = `📚 Found Hanime titles (Page ${handleReply.page + 1}/${totalPages}):\n${global.design.line}\n`;
  handleReply.hits.slice(startIndex, endIndex).forEach((hit, index) => {
    replyMessage += `${startIndex + index + 1}. ${hit.name}\n${global.design.line}\n`;
  });

  if (handleReply.page > 0) {
    replyMessage += "\nReply with 'prev' to see previous titles.";
  }
  if (endIndex < handleReply.hits.length) {
    replyMessage += "\nReply with 'next' to see more titles.";
  }
  replyMessage += `\nReply with 'number: e.g. 3' to select title.\nReply with 'all' to see all titles.`;

  const message = await chat.reply(mono(replyMessage));
  handleReply.sentMessages.push(message);
  handleReply.lastMessage = message;
};

module.exports["handleReply"] = async ({ chat, event, Utils, font, global }) => {
  const { senderID, body } = event;
  const mono = txt => font.monospace(txt);

  let handleReply = Utils.handleReply.find(reply => reply.author === senderID);

  if (!handleReply) {
    return;
  }

  const unsendAllMessages = async () => {
    for (const msg of handleReply.sentMessages) {
      await msg.unsend();
    }
    handleReply.sentMessages = [];
  };

  switch (handleReply.type) {
    case "select_hanime": {
      const command = body.trim().toLowerCase();

      await unsendAllMessages();

      if (command === "next") {
        if (handleReply.page < Math.ceil(handleReply.hits.length / 5) - 1) {
          handleReply.page++;
        } else {
          await chat.reply(mono("You have reached the end of results."));
          return;
        }
      } else if (command === "prev") {
        if (handleReply.page > 0) {
          handleReply.page--;
        } else {
          await chat.reply(mono("You are already at the first result."));
          return;
        }
      } else if (command === "all") {
        let allTitles = handleReply.hits.map((hit, index) => `${index + 1}. ${hit.name}`).join("\n");
        const msg = await chat.reply(mono(`📚 All Found Hentai titles:\n${global.design.line}\n${allTitles}\n\nReply with 'number: e.g. 3' to select title.`));
        handleReply.sentMessages.push(msg);
        handleReply.lastMessage = msg;
        return;
      } else if (!isNaN(parseInt(command, 10))) {
        const selectedIndex = parseInt(command, 10) - 1;
        if (selectedIndex >= 0 && selectedIndex < handleReply.hits.length) {
          const selectedResult = handleReply.hits[selectedIndex];
          const hanimeEpisodes = `https://hanime.tv/videos/hentai/${selectedResult.slug}`;

          try {
            const response = await axios.get(hanimeEpisodes);
            const body = response.data;
            let data = JSON.parse(body.match(/window\.__NUXT__=(.+);<\/script>/)[1]);
            let vidInfo = data.state.data.video.hentai_video;
            let vidServer = data.state.data.video.videos_manifest.servers[0];

            if (!vidServer) {
              throw new Error("No video servers found.");
            }

            vidServer.streams.map(m => m.url = !m.url ?
              global.api["hanime"][2] + `/${m.id}.m3u8` :
              m.url);

            let streams = [];

            for (let i = 0; i < vidServer.streams.length; i++) {
              streams[i] = {
                url: vidServer.streams[i].url,
                width: vidServer.streams[i].width,
                height: eval(vidServer.streams[i].height),
                duration_ms: vidServer.streams[i].duration_in_ms
              };
            }

            const videoInfo = {
              name: vidInfo.name,
              slug: vidInfo.slug,
              created_at: vidInfo.created_at,
              created_at_unix: vidInfo.created_at_unix,
              released_at: vidInfo.released_at,
              released_at_unix: vidInfo.released_at_unix,
              description: vidInfo.description,
              views: vidInfo.views,
              interests: vidInfo.interests,
              poster_url: vidInfo.poster_url,
              cover_url: vidInfo.cover_url,
              brand: vidInfo.brand,
              is_censored: vidInfo.is_censored,
              likes: vidInfo.likes,
              dislikes: vidInfo.dislikes,
              downloads: vidInfo.downloads,
              is_banned_in: vidInfo.is_banned_in,
              hentai_tags: vidInfo.hentai_tags,
              streams: streams
            };

            const streamLinks = streams.map((stream, index) => `${index + 1}. ${stream.width}x${stream.height} - ${stream.url}`).join("\n");

            let selectedMsg = await chat.reply(`📘 Selected: ${selectedResult.name}\n\nDescription: ${videoInfo.description.replace(/<\/?[^>]+(>|$)/g, "")}\n\nStreams:\n${streamLinks}`);
            const attachments = [];

            const poster = await axios.get(videoInfo.poster_url, { responseType: "stream" });
            attachments.push(poster.data);
            const cover = await axios.get(videoInfo.cover_url, { responseType: "stream" });
            attachments.push(cover.data);
            selectedMsg = chat.reply({ attachment: attachments });

            handleReply.sentMessages.push(selectedMsg);
            handleReply.lastMessage = selectedMsg;
          } catch (error) {
            const errorMsg = await chat.reply(mono(error.message));
            handleReply.sentMessages.push(errorMsg);
          }
        } else {
          const invalidMsg = await chat.reply(mono("Invalid selection. Please reply with a valid number."));
          handleReply.sentMessages.push(invalidMsg);
          handleReply.lastMessage = invalidMsg;
        }
      } else {
        const invalidCommandMsg = await chat.reply(mono("Invalid command. Please reply with a valid number, 'next', 'prev', or 'all'."));
        handleReply.sentMessages.push(invalidCommandMsg);
        handleReply.lastMessage = invalidCommandMsg;
      }
      break;
    }
  }
};
