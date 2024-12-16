module.exports["config"] = {
  name: "penis",
  version: "1.0.0",
  role: 0,
  credits: "Developer",
  info: "Inches",
  cd: 1
};

module.exports["run"] = ({ event, api }) => api.sendMessage(`8${'='.repeat(Math.floor(Math.random() * 10))}D`, event.threadID, event.messageID);