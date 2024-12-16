module.exports["config"] = {
  name: "goodnight",
  version: "1.0.1",
  role: 0,
  credits: "Markdevs69", 
  info: "greet",
  usages: "",
  cd: 5, 
};
module.exports.handleEvent = async function ({ event, chat, api }) {
  const { body } = event;
 // var id = event.senderID
//  var name = await chat.userName(id);;
  const mark = (marky) => body?.toLowerCase().startsWith(marky);
  var msg = `Goodnight, Sleep well ❤️!`;

//(pogi('pre') || pogi('prefix'))
 if (mark('tulog na ako') || mark('goodnight') || mark('night') || mark('nyt')) {
    chat.reply(msg);
  }
};