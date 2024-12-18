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
  const hajime_api = global.api.sms;
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

  // Function to generate JWT
  const jwt = async () => {
    const data = {
      Client: "2E1EEB",
      email: "natsumii@gmail.com",
      password: "XI8cb8GmrQJwQZYiq6IkGA==:e6347773648dee3dee1bb37f6c6b07c6",
    };

    const headers = {
      'User-Agent': "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36",
        'Accept-Encoding': "gzip, deflate, br, zstd",
        'Content-Type': "application/json",
        'sec-ch-ua-platform': "\"Android\"",
        'lbcoakey': "d1ca28c5933f41638f57cc81c0c24bca",
        'sec-ch-ua': "\"Chromium\";v=\"130\", \"Google Chrome\";v=\"130\", \"Not?A_Brand\";v=\"99\"",
        'token': "O8VpRnC2bIwe74mKssl11c0a1kz27aDCvIci4HIA+GOZKffDQBDkj0Y4kPodJhyQaXBGCbFJcU1CQZFDSyXPIBni",
        'sec-ch-ua-mobile': "?1",
        'origin': "https://lbconline.lbcexpress.com",
        'sec-fetch-site': "cross-site",
        'sec-fetch-mode': "cors",
        'sec-fetch-dest': "empty",
        'referer': hajime_api,
        'accept-language': "en-US,en;q=0.9,fil;q=0.8",
        'priority': "u=1, i"
    };

    const url = `${hajime_api}/lexaapi/lexav1/api/GenerateJWTToken`;
    const response = await axios.post(url, data, { headers });
    return response.data.trim().replace(/"/g, "");
  };

  // Function to generate client token
  const ctoken = async (jwtToken) => {
    const headers = {
      "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36",
      authorization: `Bearer ${jwtToken}`,
      "ocp-apim-subscription-key": "dbcd31c8bc4f471188f8b6d226bb9ff7",
      "sec-ch-ua-platform": "\"Android\"",
      "sec-ch-ua": "\"Chromium\";v=\"130\", \"Google Chrome\";v=\"130\", \"Not?A_Brand\";v=\"99\"",
      "sec-ch-ua-mobile": "?1",
      "Content-Type": "application/json",
      origin: "https://lbconline.lbcexpress.com",
      "sec-fetch-site": "cross-site",
      "sec-fetch-mode": "cors",
      "sec-fetch-dest": "empty",
      referer: hajime_api,
      "accept-language": "en-US,en;q=0.9,fil;q=0.8",
      priority: "u=1, i",
    };

    const url = `${hajime_api}/promotextertoken/generate_client_token`;
    const response = await axios.get(url, { headers });
    return response.data.client_token;
  };

  // Function to send SMS
  const sendSMS = async (number, message) => {
    const jw = await jwt();
    const ptxtoken = await ctoken(jw);

    const data = {
      Recipient: "63" + number,
      Message: message,
      ShipperUuid: "LBCEXPRESS",
      DefaultDisbursement: 3,
      ApiSecret: "03da764a333680d6ebd2f6f4ef1e2928",
      apikey: "7777be96b2d1c6d0dee73d566a820c5f",
    };

    const headers = {
      "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36",
      "Content-Type": "application/json",
      ptxtoken: ptxtoken,
      authorization: `Bearer ${jw}`,
      token: "O8VpRnC2bIwe74mKssl11c0a1kz27aDCvIci4HIA+GOZKffDQBDkj0Y4kPodJhyQaXBGCbFJcU1CQZFDSyXPIBni",
      lbcoakey: "d1ca28c5933f41638f57cc81c0c24bca",
      "sec-ch-ua": "\"Chromium\";v=\"130\", \"Google Chrome\";v=\"130\", \"Not?A_Brand\";v=\"99\"",
      "sec-ch-ua-platform": "\"Android\"",
      "sec-ch-ua-mobile": "?1",
      "origin": "https://lbconline.lbcexpress.com",
      "sec-fetch-site": "cross-site",
      "sec-fetch-mode": "cors",
      "sec-fetch-dest": "empty",
      "referer": hajime_api,
      "accept-language": "en-US,en;q=0.9,fil;q=0.8",
      "priority": "u=1, i",
    };

    const url = `${hajime_api}/lexaapi/lexav1/api/AddDefaultDisbursement`;
    const response = await axios.post(url, data, { headers });

    if (response.data.status === "ok") {
      return "✅ SMS sent successfully!";
    } else {
      return `❌ Failed to send SMS: ${response.data.message || "Unknown error"}`;
    }
  };

  // Execute SMS logic
  try {
    const result = await sendSMS(number, message);
    sending.edit(mono(result));
  } catch (error) {
    sending.edit(mono(`❌ Error: ${error.message}`));
  }
};
