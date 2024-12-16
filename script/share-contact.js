module.exports["config"] = {
  name: "share-contact",
  version: "1.0.0",
  role: 0,
  credits: "Yan Maglinte",
  info: "Share a contact of a certain userID",
  commandCategory: "message",
  cd: 5 
};

module.exports["run"] = function ({ api, event }) {
  api.shareContact("Sample of share-contact!", "100088334332155", event.threadID);
};