module.exports["config"] = {
  name: "goodmorning",
  version: "1.0.1",
  role: 0,
  credits: "Markdevs69", 
  info: "greet",
  usages: "",
  cd: 5, 
};
module.exports.handleEvent = async function ({ event, chat, api }) {
  const body = event.body ? event.body.split(' ')[0] : '';
 // var id = event.senderID
 // var name = await chat.userName(id);
  const mark = (marky) => body?.toLowerCase().startsWith(marky);
  const msg = `Goodmorning, Have a nice day ❤️!`;

//(pogi('pre') || pogi('prefix'))
 if (mark('morning') || mark('goodmorning') || mark('good morning')) {
    chat.reply(msg);
  }
};