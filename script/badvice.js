module.exports["config"] = {
  name: "advice",
  version: "1.0.1",
  role: 0,
  credits: "Joshua Sy",
  info: "advice but tagalog",
  commandCategory: "game",
  usages: "",
  cd: 0,
  dependencies: {"srod-v2": "","request": ""}
};

module.exports["run"] = async ({ event, api, args }) => {

  const request = require("request");
  const srod = require("srod-v2");
  const Data = (await srod.GetAdvice()).embed.description;

  return request(encodeURI(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=tl&dt=t&q=${Data}`), (err, response, body) => {
    if (err) return api.sendMessage("Error", event.threadID, event.messageID);
    var retrieve = JSON.parse(body);
    var text = '';
    retrieve[0].forEach(item => (item[0]) ? text += item[0] : '');
    api.sendMessage(text, event.threadID, event.messageID)
  });
}