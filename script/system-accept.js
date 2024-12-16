const moment = require("moment-timezone");

module.exports["config"] = {
  name: "accept",
  version: "1.0.0",
  role: 2,
  credits: "Developer",
  info: "Accept friend requests on bot.",
  usages: "accept approve [UID]",
  cd: 5,
};

module.exports["run"] = async ({ api, event, args }) => {
  const handleApprove = async (targetUID) => {
    const form = {
      av: api.getCurrentUserID(),
      fb_api_req_friendly_name: "FriendingCometFriendRequestConfirmMutation",
      doc_id: "3147613905362928",
      variables: JSON.stringify({
        input: {
          source: "friends_tab",
          actor_id: api.getCurrentUserID(),
          friend_requester_id: targetUID,
          client_mutation_id: Math.round(Math.random() * 19).toString(),
        },
        scale: 3,
        refresh_num: 0,
      }),
    };
    const success = [];
    const failed = [];
    try {
      const friendRequest = await api.httpPost(
        "https://www.facebook.com/api/graphql/",
        form
      );
      if (JSON.parse(friendRequest).errors) failed.push(targetUID);
      else success.push(targetUID);
    } catch (e) {
      failed.push(targetUID);
    }
    return { success, failed };
  };

  const { threadID, messageID } = event;
  const [command, uid] = args;

  if (command === "approve") {
    if (!uid || isNaN(uid)) {
      return api.sendMessage(
        "Invalid syntax. Use: accept approve <UID>",
        threadID,
        messageID
      );
    }
    const { success, failed } = await handleApprove(uid);
    if (success.length > 0) {
      api.sendMessage(
        `Approved friend request for UID ${success.join(", ")}`,
        threadID,
        messageID
      );
    }
    if (failed.length > 0) {
      api.sendMessage(
        `Failed to approve friend request for UID ${failed.join(", ")}`,
        threadID,
        messageID
      );
    }
    return;
  }

  const form = {
    av: api.getCurrentUserID(),
    fb_api_req_friendly_name:
      "FriendingCometFriendRequestsRootQueryRelayPreloader",
    fb_api_caller_class: "RelayModern",
    doc_id: "4499164963466303",
    variables: JSON.stringify({ input: { scale: 3 } }),
  };

  try {
    const listRequest = JSON.parse(
      await api.httpPost("https://www.facebook.com/api/graphql/", form)
    ).data.viewer.friending_possibilities.edges;

    let msg = "";
    let i = 0;
    for (const user of listRequest) {
      i++;
      msg +=
        `\n${i}. Name: ${user.node.name}` +
        `\nID: ${user.node.id}` +
        `\nUrl: ${user.node.url.replace("www.facebook", "fb")}` +
        `\nTime: ${moment(user.time * 1000)
          .tz("Asia/Manila")
          .format("DD/MM/YYYY HH:mm:ss")}\n`;
    }
    api.sendMessage(
      `${msg}\nApprove friend request using UID: accept approve <UID>`,
      threadID,
      messageID
    );
  } catch (error) {
    api.sendMessage(error.message, threadID, messageID);
  }
};