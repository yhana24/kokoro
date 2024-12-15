module.exports["config"] = {
        name: "setbio",
        role: 1,
        aliases: ["bio", "changebio"],
        info: "set bots bio",
        usage: "[text]",
        isPrefix: true,
        guide: "setname pogi ko",
        cd: 20
},

module.exports["run"] = async ({ chat, args, font }) => {
        var mono = txt => font.monospace(txt);
        const bio = args.join(" ");
        if (!bio) {
                return chat.reply(mono("Please provide a text you want to set as bots bio!"));
        }
        
        chat.bio(bio);
        chat.reply(mono("Successfully Set Bio to: " + bio));
}
