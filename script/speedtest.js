module.exports["config"] = {
  name: "speedtest",
  version: "1.0.0",
  role: 0,
  credits: "developer",
  info: "Test network speed",
  commandCategory: "system",
  cd: 3,
  dependencies: {
  "fast-speedtest-api": ""
}
};

module.exports["run"] = async function({ api, event, chat, fonts }) {
try {
  const fast = require("fast-speedtest-api");
  const speedTest = new fast({
    token: "YXNkZmFzZGxmbnNkYWZoYXNkZmhrYWxm",
    verbose: false,
    timeout: 10000,
    https: true,
    urlCount: 5,
    bufferSize: 8,
    unit: fast.UNITS.Mbps
  });
  const juswa = await speedTest.getSpeed();
  return chat.reply(fonts.monospace(
    "➠Result" + 
    "\n⟿Speed: " + juswa + " MBPS",
    event.threadID, event.messageID
  ));
}
catch {
  return api.sendMessage("Error", event.threadID, event.messageID);
}
}