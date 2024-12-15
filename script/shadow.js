const axios = require("axios");

module.exports["config"] = {
  name: "shadow",
  info: "Get a random shadow garden edit",
  isPrefix: false,
  version: "1.0.0",
  credits: "Kenneth Panio",
  type: "random-video",
};

let uniqueVideos = new Set();
let cursor = 1;

module.exports["run"] = async ({ chat, font }) => {
  const mono = (txt) => font.monospace(txt);
  const fetching = await chat.reply(mono("I AM ATOMIC!!!"));

  try {
    while (true) {
      const params = {
        keywords: "shadow garden",
        count: 10,
        cursor,
        from_page: "search",
        web_search_code: '{"tiktok":{"client_params_x":{"search_engine":{"ies_mt_user_live_video_card_use_libra":1,"mt_search_general_user_live_card":1}},"search_server":{}}}',
      };

      const { data } = await axios.get("https://www.tikwm.com/api/feed/search", {
        params,
      });

      const videos = data?.data?.videos || [];

      if (!videos.length) {
        fetching.unsend();
        return chat.reply(mono("No Shadow Garden Contents Found!"));
      }

      const newVideos = videos.filter(({ video_id }) => !uniqueVideos.has(video_id));

      if (!newVideos.length && !data.data.hasMore) {
        uniqueVideos.clear();
        await chat.reply(mono("All shadow garden videos have been shown. Resetting the list..."));
        continue;
      }

      const randomVideo = newVideos.length > 0
        ? newVideos[Math.floor(Math.random() * newVideos.length)]
        : null;

      if (randomVideo) {
        uniqueVideos.add(randomVideo.video_id);
        cursor = data.data.cursor;

        await chat.reply({
          body: mono(
            `Username: ${randomVideo.author.unique_id}\n` +
            `Plays: ${randomVideo.play_count}\n` +
            `Likes: ${randomVideo.digg_count}\n` +
            `Comments: ${randomVideo.comment_count}\n` +
            `Shares: ${randomVideo.share_count}\n` +
            `Downloads: ${randomVideo.download_count}\n` +
            `Created: ${new Date(randomVideo.create_time * 1000).toLocaleString()}`
          ),
          attachment: await chat.stream(randomVideo.play),
        });
        fetching.unsend();
        break;
      }
    }
  } catch (error) {
    fetching.unsend();
    chat.reply(mono(`ERROR: ${error.message}`));
  }
};