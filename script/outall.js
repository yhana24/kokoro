module.exports["config"] = {
  name: "outall",
  version: "1.0.0",
  role: 1,
  credits: "HungCho",
  info: "out of whole group",
  cd: 5
};

module.exports["run"] = async function ({ event, args, chat }) {
  try {
    const list = await chat.threadList();
    list.forEach(async (item) => {
      if (item.isGroup && item.threadID !== event.threadID) {
        await chat.kick(chat.botID(), item.threadID);
      }
    });
    await chat.reply('Out of all other groups successfully');
  } catch (err) {
    chat.error(err.message);
  }
};