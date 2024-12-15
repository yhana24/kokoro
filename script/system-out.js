module.exports["config"] = {
  name: "out",
  type: "utility",
  version: "1.0.0",
  role: 1,
  credits: "Developer",
  info: "Bot leaves the thread",
  cd: 10,
};

module.exports["run"] = async function({ api, event, args }) {
  try { 
  if (!args[0]) return api.removeUserFromGroup(api.getCurrentUserID(), event.threadID);
  if (!isNaN(args[0])) return api.removeUserFromGroup(api.getCurrentUserID(), args.join(" "));
    } catch (error) {
      api.sendMessage(error.message, event.threadID, event.messageID);
    }
};