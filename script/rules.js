module.exports["config"] = {
    name: "rules",
    aliases: ["rule"],
    isPrefix: false,
    info: "BOT GC RULES AND SIMPLE RULES",
    cd: 10
};

module.exports["run"] = async ({ chat, event, font }) => {

if (!event.isGroup) return chat.reply(font.bold("Avoid Spamming and Abuse CMDS. to prevent getting banned from chatbot."));

const rules = `1. 𝗥𝗲𝘀𝗽𝗲𝗰𝘁 𝗘𝗮𝗰𝗵 𝗢𝘁𝗵𝗲𝗿: Always be kind and respectful. No insults or negative comments.

2. 𝗦𝘁𝗮𝘆 𝗢𝗻 𝗧𝗼𝗽𝗶𝗰: Try to keep discussions relevant to the group’s theme or interests.

3. 𝗡𝗼 𝗦𝗽𝗮𝗺𝗺𝗶𝗻𝗴: Avoid sending multiple messages in a row; give others a chance to respond.

4. 𝗘𝗺𝗼𝗷𝗶 𝗖𝗲𝗻𝘁𝗿𝗮𝗹: Use emojis liberally! They bring joy and help express feelings.

5. 𝗠𝗲𝗺𝗲 𝗦𝗵𝗮𝗿𝗶𝗻𝗴: Share your favorite memes but ensure they’re appropriate for the group.

6. 𝗙𝘂𝗻 𝗙𝗿𝗶𝗱𝗮𝘆𝘀: Make Fridays dedicated to sharing funny stories or jokes.

7. 𝗖𝗵𝗮𝗹𝗹𝗲𝗻𝗴𝗲 𝗼𝗳 𝘁𝗵𝗲 𝗪𝗲𝗲𝗸: Introduce a fun challenge each week, like a cooking challenge or photo contest!

8. 𝗗𝗮𝗶𝗹𝘆 𝗧𝗵𝗲𝗺𝗲 𝗗𝗮𝘆𝘀: Have theme days like Movie Monday or Throwback Thursday to spark creativity.

9. 𝗡𝗼 𝗗𝗿𝗮𝗺𝗮 𝗭𝗼𝗻𝗲: Keep personal conflicts outside the group to maintain a positive vibe.

10. 𝗣𝗼𝗹𝗹 𝗜𝘁: Create polls for fun debates or decisions, like what to binge-watch next.

11. 𝗦𝗶𝗹𝗹𝘆 𝗡𝗶𝗰𝗸𝗻𝗮𝗺𝗲𝘀: Give each other fun nicknames and use them in the chat!

12. 𝗥𝗲𝘀𝗽𝗲𝗰𝘁 𝗤𝘂𝗶𝗲𝘁 𝗧𝗶𝗺𝗲: Keep the noise down during late hours; we all need our beauty sleep!

13. 𝗚𝗜𝗙 𝗪𝗮𝗿𝘀: Engage in a friendly GIF battle to respond to messages.

14. 𝗦𝗵𝗼𝘂𝘁𝗼𝘂𝘁𝘀 & 𝗖𝗲𝗹𝗲𝗯𝗿𝗮𝘁𝗶𝗼𝗻𝘀: Celebrate achievements, birthdays, and milestones together!

15. 𝗠𝘆𝘀𝘁𝗲𝗿𝘆 𝗤&𝗔: Once a week, have a "guess who" game with fun facts about each member.

16. 𝗕𝗼𝗼𝗸/𝗦𝗵𝗼𝘄 𝗖𝗹𝘂𝗯: Start a monthly book or show discussion for some enriching chats.

17. 𝗡𝗼 𝗙𝗼𝗿𝘄𝗮𝗿𝗱𝗶𝗻𝗴 𝗪𝗶𝘁𝗵𝗼𝘂𝘁 𝗣𝗲𝗿𝗺𝗶𝘀𝘀𝗶𝗼𝗻: Always ask before sharing someone else's message or media.

18. 𝗧𝗶𝗺𝗲-𝗢𝘂𝘁: If a conversation gets too heated, take a break and come back later to cool off.

19. 𝗥𝗮𝗻𝗱𝗼𝗺 𝗔𝗰𝘁𝘀 𝗼𝗳 𝗞𝗶𝗻𝗱𝗻𝗲𝘀𝘀: Encourage sharing compliments or kind words to uplift each other.

20. 𝗛𝗮𝘃𝗲 𝗙𝘂𝗻: Remember that the main goal is to have a good time together, so let loose and enjoy!`;
chat.reply(font.thin(rules));
};