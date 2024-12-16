module.exports["config"] = {
  name: "couple",
  version: "1.0.0",
  role: 0,
  credits: "developer",
  info: "random love",
  usages: "send message",
  cd: 0,
  dependencies: {}
};

module.exports["run"] = async function({ api, event, Users, chat }) {
        const axios = require("axios");
        const fs = require("fs-extra");
        const TOKEN = "6628568379%7Cc1e620fa708a1d5696fb991c1bde5662";
        //var data = await Currencies.getData(event.senderID);
        //var money = data.money
        //if( money < 1) api.sendMessage(`You don't have enough money, try to use "cave" to earn money or play games.`, event.threadID, event.messageID) //thay số tiền cần trừ vào 0, xóa money = 0
      //  else {
        var tile = Math.floor(Math.random() * 101);


        //let loz = await api.getThreadInfo(event.threadID);
        var emoji = event.participantIDs;
        var id = emoji[Math.floor(Math.random() * emoji.length)];

        var namee = await chat.userName(event.senderID);
        var name = await chat.userName(id);

        /*var arraytag = [];
        arraytag.push({id: event.senderID, tag: namee});
        arraytag.push({id: id, tag: name});

        chat.nickname(`wife ${name}`, event.threadID, event.senderID);
        chat.nickname(`husband of ${namee}`, event.threadID, id);*/
       // Currencies.setData(event.senderID, options = {money: money - 1})

        let Avatar = (await axios.get( `https://graph.facebook.com/${id}/picture?height=720&width=720&access_token=${TOKEN}`, { responseType: "arraybuffer" } )).data; 
            fs.writeFileSync( __dirname + "/cache/1.png", Buffer.from(Avatar, "utf-8") );
        let Avatar2 = (await axios.get( `https://graph.facebook.com/${event.senderID}/picture?height=720&width=720&access_token=${TOKEN}`, { responseType: "arraybuffer" } )).data;
            fs.writeFileSync( __dirname + "/cache/2.png", Buffer.from(Avatar2, "utf-8") );
        var imglove = [];
              imglove.push(fs.createReadStream(__dirname + "/cache/1.png"));
              imglove.push(fs.createReadStream(__dirname + "/cache/2.png"));
        var msg = {body: `New couple\nRomance: ${tile}%\n`+namee+" "+"💓"+" "+name, attachment: imglove}
        return api.sendMessage(msg, event.threadID, event.messageID);
        //fs.unlinkSync(__dirname + '/cache/1.png');
        //fs.unlinkSync(__dirname + '/cache/2.png');
}