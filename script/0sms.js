const axios = require("axios");
const randomUseragent = require("random-useragent");

module.exports["config"] = {
  name: "sms",
  aliases: ["lbcsms", "lbcexpress"],
  isPrefix: false,
  version: "1.0.0",
  credits: "Kenneth Panio",
  role: 0,
  type: "utility",
  info: "Send SMS to a specified number.",
  usage: "sms [number] [message]",
  guide: "sms 09123456789 Hello, this is a test message!",
  cd: 10,
};

// Bot command execution
module.exports["run"] = async ({ chat, args, font, global }) => {
  const mono = (txt) => font.monospace(txt);

  if (args.length < 2) {
    chat.reply(mono("Usage: sms [number] [message]"));
    return;
  }

  let number = args[0];
  const message = args.slice(1).join(" ");

  // Normalize the phone number
  if (number.startsWith("+63")) {
    number = number.slice(3); // Remove "+63"
  } else if (number.startsWith("63")) {
    number = number.slice(2); // Remove "63"
  } else if (number.startsWith("0")) {
    number = number.slice(1); // Remove "0"
  }

  // Ensure the phone number is 10 digits long
  if (!/^\d{10}$/.test(number)) {
    chat.reply(
      mono(
        "Invalid phone number. It should be a PH number and start with +63, 63, or 0. Must be 10-11 digits."
      )
    );
    return;
  }

  const sending = await chat.reply(mono("🕐 | Sending SMS..."));

  // JWT function
  const jwt = async () => {
    try {
      const data = {
        Client: "2E1EEB",
        email: "natsumii@gmail.com",
        password: "XI8cb8GmrQJwQZYiq6IkGA==:e6347773648dee3dee1bb37f6c6b07c6",
      };

      const headers = {
        "User-Agent": randomUseragent.getRandom(),
        "Content-Type": "application/json",
        token: "O8VpRnC2bIwe74mKssl11c0a1kz27aDCvIci4HIA+GOZKffDQBDkj0Y4kPodJhyQaXBGCbFJcU1CQZFDSyXPIBni",
      };

      const url = `${global.api.sms}/lexaapi/lexav1/api/GenerateJWTToken`;
      const response = await axios.post(url, data, { headers });

      if (!response.data) throw new Error("JWT generation failed");
      return response.data.trim().replace(/"/g, "");
    } catch (error) {
      throw new Error(`JWT Error: ${error.message}`);
    }
  };

  // Client token function
  const ctoken = async (jwtToken) => {
    try {
      const headers = {
        "User-Agent": randomUseragent.getRandom(),
        authorization: `Bearer ${jwtToken}`,
        "Content-Type": "application/json",
        "ocp-apim-subscription-key": "dbcd31c8bc4f471188f8b6d226bb9ff7",
      };

      const url = `${global.api.sms}/promotextertoken/generate_client_token`;
      const response = await axios.get(url, { headers });

      if (!response.data.client_token) throw new Error("Client token not received");
      return response.data.client_token;
    } catch (error) {
      throw new Error(`Client Token Error: ${error.message}`);
    }
  };

  // SMS sending function
  const sendSMS = async (number, message) => {
    try {
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
        "User-Agent": randomUseragent.getRandom(),
        "Content-Type": "application/json",
        ptxtoken: clientToken,
        authorization: `Bearer ${jwtToken}`,
        token: "O8VpRnC2bIwe74mKssl11c0a1kz27aDCvIci4HIA+GOZKffDQBDkj0Y4kPodJhyQaXBGCbFJcU1CQZFDSyXPIBni",
      };

      const url = `${global.api.sms}/lexaapi/lexav1/api/AddDefaultDisbursement`;
      const response = await axios.post(url, data, { headers });

      return response.data;
    } catch (error) {
      throw new Error(`SMS Sending Error: ${error.message}`);
    }
  };

  // Execute the SMS sending process
  try {
    const result = await sendSMS(number, message);

    if (result.status === "ok") {
      sending.edit(mono("✅ | SMS SENT SUCCESSFULLY!"));
    } else {
      sending.edit(mono(`❌ | SMS Failed: ${result.message || "Unknown error"}`));
    }
  } catch (error) {
    sending.edit(mono(`❌ | Error: ${error.message}`));
  }
};
