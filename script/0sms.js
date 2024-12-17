const axios = require("axios");

module.exports["config"] = {
  name: "sms",
  aliases: ["lbcsms", "lbcexpress"],
  isPrefix: false,
  version: "1.0.1",
  credits: "Kenneth Panio",
  role: 0,
  type: "utility",
  info: "Send SMS to a specified PH number.",
  usage: "sms [number] [message]",
  guide: "sms 09123456789 Hello, this is a test message!",
  cd: 10,
};

// Run the command
module.exports["run"] = async ({ chat, args, font, global }) => {
  const mono = (txt) => font.monospace(txt);

  // Validate arguments
  if (args.length < 2) {
    chat.reply(mono("❗ Usage: sms [number] [message]"));
    return;
  }

  let number = args[0];
  const message = args.slice(1).join(" ");

  // Normalize and validate the phone number
  if (number.startsWith("+63")) {
    number = number.slice(3);
  } else if (number.startsWith("63")) {
    number = number.slice(2);
  } else if (number.startsWith("0")) {
    number = number.slice(1);
  }

  if (!/^\d{10}$/.test(number)) {
    chat.reply(mono("❗ Invalid PH phone number. Must be 10 digits starting with 09."));
    return;
  }

  const sending = await chat.reply(mono("🕐 Sending SMS..."));

  // Function to get JWT
  const jwt = async () => {
    try {
      const data = {
        Client: "2E1EEB",
        email: "natsumii@gmail.com",
        password: "XI8cb8GmrQJwQZYiq6IkGA==:e6347773648dee3dee1bb37f6c6b07c6",
      };

      const headers = {
        "User-Agent": "Mozilla/5.0 (Linux; Android 10)",
        "Content-Type": "application/json",
        token: "O8VpRnC2bIwe74mKssl11c0a1kz27aDCvIci4HIA+GOZKffDQBDkj0Y4kPodJhyQaXBGCbFJcU1CQZFDSyXPIBni",
      };

      const url = `${global.api.sms}/lexaapi/lexav1/api/GenerateJWTToken`;
      const response = await axios.post(url, data, { headers });
      return response.data.trim().replace(/"/g, "");
    } catch (error) {
      throw new Error("Failed to generate JWT: " + error.message);
    }
  };

  // Function to get client token
  const ctoken = async (jwtToken) => {
    try {
      const headers = {
        "User-Agent": "Mozilla/5.0 (Linux; Android 10)",
        authorization: `Bearer ${jwtToken}`,
        "ocp-apim-subscription-key": "dbcd31c8bc4f471188f8b6d226bb9ff7",
      };

      const url = `${global.api.sms}/promotextertoken/generate_client_token`;
      const response = await axios.get(url, { headers });
      return response.data.client_token;
    } catch (error) {
      throw new Error("Failed to generate client token: " + error.message);
    }
  };

  // Function to send SMS
  const sendSMS = async (number, message) => {
    const jwtToken = await jwt();
    const clientToken = await ctoken(jwtToken);

    const data = {
      Recipient: "63" + number,
      Message: message,
      ShipperUuid: "LBCEXPRESS",
      DefaultDisbursement: 3,
      ApiSecret: "03da764a333680d6ebd2f6f4ef1e2928",
      apikey: "7777be96b2d1c6d0dee73d566a820c5f",
    };

    const headers = {
      "User-Agent": "Mozilla/5.0 (Linux; Android 10)",
      "Content-Type": "application/json",
      ptxtoken: clientToken,
      authorization: `Bearer ${jwtToken}`,
      token: "O8VpRnC2bIwe74mKssl11c0a1kz27aDCvIci4HIA+GOZKffDQBDkj0Y4kPodJhyQaXBGCbFJcU1CQZFDSyXPIBni",
    };

    const url = `${global.api.sms}/lexaapi/lexav1/api/AddDefaultDisbursement`;
    const response = await axios.post(url, data, { headers });
    return response.data;
  };

  // Execute SMS logic
  try {
    const result = await sendSMS(number, message);

    if (result.status === "ok") {
      sending.edit(mono("✅ SMS sent successfully!"));
    } else {
      sending.edit(mono(`❌ Failed to send SMS: ${result.message || "Unknown error"}`));
    }
  } catch (error) {
    sending.edit(mono(`❌ Error: ${error.message}`));
  }
};
