const axios = require("axios");
const randomUserAgent = require("random-useragent");

module.exports["config"] = {
  name: "nhentai",
  version: "2.5.0",
  credits: "Kenneth Panio",
  info: "Search and view nhentai manga images.",
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
      type: "select_hentai",
      page: 0,
      results: [],
      author: senderID,
      sentMessages: []
    };
    Utils.handleReply.push(handleReply);
  }

  if (!args[0] && handleReply.results.length === 0) {
    await chat.reply(mono("Please provide a search query."));
    return;
  }

  if (args[0]) {
    const searchQuery = args.join(" ");
    try {
      const response = await axios.get(`${global.api["nhentai"][0]}?query=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'User-Agent': randomUserAgent.getRandom()
        }
      });

      if (!response.data || !response.data.result || response.data.result.length === 0) {
        await chat.reply(mono("No results found for your query."));
        return;
      }

      const results = await Promise.all(
        response.data.result.map(async result => {
          try {
            await axios.get(
              `${global.api["nhentai"][1]}/${result.media_id}/1.jpg`,
              {
                headers: {
                  'User-Agent': randomUserAgent.getRandom()
                }
              }
            );
            return result;
          } catch (error) {
            if (error.response && [404, 403, 401, 502, 503, 500].includes(error.response.status)) {
              return null;
            } else {
              throw error;
            }
          }
        })
      );

      const validResults = results.filter(result => result !== null);

      if (validResults.length === 0) {
        await chat.reply(mono("No accessible results found for your query."));
        return;
      }

      handleReply.results = validResults;
      handleReply.page = 0;
    } catch (error) {
      await chat.reply(mono(error.message));
      return;
    }
  }

  const resultsPerPage = 5;
  const totalPages = Math.ceil(handleReply.results.length / resultsPerPage);
  const startIndex = handleReply.page * resultsPerPage;
  const endIndex = Math.min(startIndex + resultsPerPage, handleReply.results.length);

  let replyMessage = `📚 Found Hentai titles (Page ${handleReply.page + 1}/${totalPages}):\n` + global.design.line + "\n";
  handleReply.results.slice(startIndex, endIndex).forEach((result, index) => {
    replyMessage += `${startIndex + index + 1}. ${result.title.english}\n` + global.design.line + "\n";
  });

  if (handleReply.page > 0) {
    replyMessage += "\nReply with 'prev' to see previous titles.";
  }
  if (endIndex < handleReply.results.length) {
    replyMessage += "\nReply with 'next' to see more titles.";
  }
  replyMessage += "\nReply with 'all' to see all titles.";
  replyMessage += `\nReply with 'number: e.g. 3' to select title.`;

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
    case "select_hentai": {
      const command = body.trim().toLowerCase();

      await unsendAllMessages();

      if (command === "next") {
        if (handleReply.page < Math.ceil(handleReply.results.length / 5) - 1) {
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
        let allfound = `📚 All Found Hentai titles:\n` + global.design.line + "\n";
        let alltitles = "";
        handleReply.results.forEach((result, index) => {
          alltitles += `${index + 1}. ${result.title.english}\n` + global.design.line + "\n";
        });
        const msg = await chat.reply(mono(allfound + alltitles + `\nReply with 'number: e.g. 3' to select title.`));
        handleReply.sentMessages.push(msg);
        handleReply.lastMessage = msg;
        return;
      } else if (!isNaN(parseInt(command, 10))) {
        const selectedIndex = parseInt(command, 10) - 1;
        if (selectedIndex >= 0 && selectedIndex < handleReply.results.length) {
          const selectedResult = handleReply.results[selectedIndex];
          handleReply.selectedResult = selectedResult;
          handleReply.pageNumber = 1;
          handleReply.type = "page";

          const msg = await chat.reply(mono(`📘 Selected: ${selectedResult.title.english}\nPages: ${selectedResult.num_pages}\n\nLoading pages 1-6...`));
          handleReply.sentMessages.push(msg);
          handleReply.lastMessage = msg;

          try {
            const pagePromises = Array.from({ length: Math.min(6, selectedResult.num_pages) }, (_, i) => {
              const pageIndex = i + 1;
              const mangaImageUrl = `${global.api["nhentai"][1]}/${selectedResult.media_id}/${pageIndex}.jpg`;
              return axios.get(mangaImageUrl, {
                responseType: "stream",
                headers: {
                  'Referer': 'https://nhentai.net/',
                  'User-Agent': randomUserAgent.getRandom()
                }
              });
            });

            const responses = await Promise.all(pagePromises);
            const attachments = responses.map(response => response.data);

            const msgWithAttachments = await chat.reply({
              body: mono(`${handleReply.pageNumber}-${Math.min(handleReply.pageNumber + 5, handleReply.selectedResult.num_pages)}`),
              attachment: attachments
            });

            handleReply.sentMessages.push(msgWithAttachments);

            const nextMsg = await chat.reply(mono(`Reply with "next" to load pages 7-12, "prev" to go back, or "end" to stop reading.`));
            handleReply.sentMessages.push(nextMsg);
            handleReply.lastMessage = nextMsg;
          } catch (error) {
            const errorMsg = await chat.reply(mono(`Failed to load manga images (unavailable for now). Please select another title or try again later. Still doesn't work? that means the bot is temporary restricted from sending multiple attachment in short amount of time.`));
            handleReply.sentMessages.push(errorMsg);
            handleReply.type = "select_hentai";
            delete handleReply.selectedResult;
            delete handleReply.pageNumber;
            Utils.handleReply[Utils.handleReply.indexOf(handleReply)] = handleReply;
          }

          return;
        } else {
          const invalidMsg = await chat.reply(mono("Invalid selection. Please reply with a valid number."));
          handleReply.sentMessages.push(invalidMsg);
          handleReply.lastMessage = invalidMsg;
          return;
        }
      } else {
        const invalidCommandMsg = await chat.reply(mono("Invalid command. Please reply with a valid number, 'next', 'prev', or 'all'."));
        handleReply.sentMessages.push(invalidCommandMsg);
        handleReply.lastMessage = invalidCommandMsg;
        return;
      }

      const resultsPerPage = 5;
      const totalPages = Math.ceil(handleReply.results.length / resultsPerPage);
      const startIndex = handleReply.page * resultsPerPage;
      const endIndex = Math.min(startIndex + resultsPerPage, handleReply.results.length);

      let replyMessage = `📚 Found Hentai titles (Page ${handleReply.page + 1}/${totalPages}):\n` + global.design.line + "\n";
      handleReply.results.slice(startIndex, endIndex).forEach((result, index) => {
        replyMessage += `${startIndex + index + 1}. ${result.title.english}\n` + global.design.line + "\n";
      });

      if (handleReply.page > 0) {
        replyMessage += "\nReply with 'prev' to see previous titles.";
      }
      if (endIndex < handleReply.results.length) {
        replyMessage += "\nReply with 'next' to see more titles.";
      }
      replyMessage += `\nReply with 'number: e.g. 3' to select title.`;

      const message = await chat.reply(mono(replyMessage));
      handleReply.sentMessages.push(message);
      handleReply.lastMessage = message;

      break;
    }

    case "page": {
      const command = body.trim().toLowerCase();

      await unsendAllMessages();

      if (command === "end") {
        handleReply.lastMessage = await chat.reply(mono("Reading session ended."));
        Utils.handleReply = Utils.handleReply.filter(reply => reply.author !== senderID);
        return;
      }

      let newPageNumber;

      if (command === "next") {
        newPageNumber = handleReply.pageNumber + 6;
        if (newPageNumber > handleReply.selectedResult.num_pages) {
          newPageNumber = handleReply.selectedResult.num_pages;
          handleReply.lastMessage = await chat.reply(mono("You have reached the end of the manga."));
        }
      } else if (command === "prev") {
        newPageNumber = handleReply.pageNumber - 6;
        if (newPageNumber < 1) {
          newPageNumber = 1;
          handleReply.lastMessage = await chat.reply(mono("You are already at the beginning of the manga."));
        }
      } else {
        handleReply.lastMessage = await chat.reply(mono('Invalid command. Please reply with "next", "prev", or "end".'));
        return;
      }

      handleReply.pageNumber = newPageNumber;
      const newPageLimit = Math.min(newPageNumber + 5, handleReply.selectedResult.num_pages);
      const prevCommandStartPage = Math.max(newPageNumber - 6, 1);
      const nextCommandStartPage = newPageLimit + 1;

      try {
        const pagePromises = Array.from({ length: newPageLimit - newPageNumber + 1 }, (_, i) => {
          const pageIndex = newPageNumber + i;
          const mangaImageUrl = `${global.api["nhentai"][1]}/${handleReply.selectedResult.media_id}/${pageIndex}.jpg`;
          return axios.get(mangaImageUrl, {
            responseType: "stream",
            headers: {
              'Referer': 'https://nhentai.net/',
              'User-Agent': randomUserAgent.getRandom()
            }
          });
        });

        const responses = await Promise.all(pagePromises);
        const attachments = responses.map(response => response.data);

        const msgWithAttachments = await chat.reply({
          body: mono(`${handleReply.pageNumber}-${Math.min(handleReply.pageNumber + 5, handleReply.selectedResult.num_pages)}`),
          attachment: attachments
        });

        handleReply.sentMessages.push(msgWithAttachments);

        let navigationMessage;
        if (prevCommandStartPage > 0 && nextCommandStartPage <= handleReply.selectedResult.num_pages) {
          navigationMessage = `Reply with "next" to load pages ${nextCommandStartPage}-${Math.min(nextCommandStartPage + 5, handleReply.selectedResult.num_pages)}, "prev" to go back to pages ${prevCommandStartPage}-${newPageNumber - 1}, or "end" to stop reading.`;
        } else if (prevCommandStartPage <= 0) {
          navigationMessage = `Reply with "next" to load pages ${nextCommandStartPage}-${Math.min(nextCommandStartPage + 5, handleReply.selectedResult.num_pages)}, or "end" to stop reading.`;
        } else if (nextCommandStartPage > handleReply.selectedResult.num_pages) {
          navigationMessage = `Reply with "prev" to go back to pages ${prevCommandStartPage}-${newPageNumber - 1}, or "end" to stop reading.`;
        }

        const nextMsg = await chat.reply(mono(navigationMessage));
        handleReply.sentMessages.push(nextMsg);
        handleReply.lastMessage = nextMsg;
      } catch (error) {
        const errorMsg = await chat.reply(mono(error.message || `Failed to load manga images. Please try again. Still doesn't work? that means the bot is temporary restricted from sending multiple attachment in short amount of time.`));
        handleReply.sentMessages.push(errorMsg);
      }

      break;
    }
  }
};
