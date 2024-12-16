module.exports["config"] = {
  name: "chords",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Joshua Sy",
  description: "Search Chords",
  usages: "[song title]",
  commandCategory: "Searching",
  cooldowns: 3
};

module.exports["run"] = async ({ api, event,args, Users, __GLOBAL }) => {
const tabs = require("ultimate-guitar")
 let qwerty = args.join(" ");
if (!qwerty) return api.sendMessage(`Wrong format:\nuse chords [here title of the song]\n\nRemove: []`, event.threadID, event.messageID);

try{
const res = await tabs.firstData(qwerty);

var title = res.title
var chords = res.chords
var type = res.type
var key = res.key
var artist = res.artist

api.sendMessage(`Artist: ${artist}\nTitle: ${title}\nType: ${type}\nKey: ${key}\n——Here’s the cords——\n\n${chords}\n\n——End——`, event.threadID, event.messageID);
} catch(err){
 console.log("[ERR] " + err);
api.sendMessage("[ERR] " + err, event.threadID, event.messageID);
}
}