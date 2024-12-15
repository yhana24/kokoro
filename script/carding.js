const axios = require('axios');

module.exports["config"] = {
        name: "ccgen",
        aliases: ["carding", "cc"],
        info: "Generate random credit card details for all supported card types",
        isPrefix: true,
        version: "1.0.0",
        type: "carding",
        credits: "Kenneth panio",
};

module.exports["run"] = async ({ api, event }) => {
        const cardTypes = ["visa", "americanexpress", "discover", "mastercard", "jcb"];
        const chat = (txt) => api.sendMessage(txt, event.threadID);
        const unsend = (id) => api.unsendMessage(id);

        const answering = await chat("Generating card details for all card types...");

        try {
                const results = await Promise.all(cardTypes.map(async (cardType, index) => {
                        try {
                                const response = await axios.post('https://randommer.io/Card',
                                        `Type=${cardType}&X-Requested-With=XMLHttpRequest`,
                                        {
                                                headers: {
                                                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                                                        'Accept': '*/*',
                                                        'X-Requested-With': 'XMLHttpRequest',
                                                        'User-Agent': 'Mozilla/5.0 (Linux; Android 12; Infinix X669 Build/SP1A.210812.016; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/128.0.6613.6 Mobile Safari/537.36',
                                                        'Referer': 'https://randommer.io/Card',
                                                },
                                                responseType: 'json'
                                        }
                                );
                                return { index, cardType, data: response.data };
                        } catch (error) {
                                return { index, cardType, error: `Error fetching ${cardType} card` };
                        }
                }));

                const message = results.map(result => {
                        if (result.error) {
                                return `Card ${result.index + 1} (${result.cardType.charAt(0).toUpperCase() + result.cardType.slice(1)}): ${result.error}`;
                        } else {
                                const { type, cardNumber, cvv, date, fullName } = result.data;
                                return `${result.index + 1}. Name: ${fullName}\nType: ${type}\nCard Number: ${cardNumber}\nCVV: ${cvv}\nExpiry Date: ${date}`;
                        }
                }).join('\n\n');

                await chat(message);
                unsend(answering.messageID);
        } catch (error) {
                await chat(`Error: ${error.message}`);
                unsend(answering.messageID);
        }
};
