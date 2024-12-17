const axios = require('axios');

module.exports["config"] = {
    name: "sms",
    aliases: ["lbcsms", "lbcexpress"],
    isPrefix: false,
    version: "1.0.2",
    credits: "Kenneth Panio",
    role: 0,
    type: "utility",
    info: "Send SMS to a specified PH number.",
    usage: "sms [number] [message]",
    guide: "sms 09123456789 Hello, this is a test message!",
    cd: 10,
};

// Function to generate JWT Token
async function jwt() {
    const data = {
        Client: "2E1EEB",
        email: "natsumii@gmail.com",
        password: "XI8cb8GmrQJwQZYiq6IkGA==:e6347773648dee3dee1bb37f6c6b07c6"
    };

    const headers = {
        'User-Agent': "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36",
        'Accept-Encoding': "gzip, deflate, br, zstd",
        'Content-Type': "application/json",
        'lbcoakey': "d1ca28c5933f41638f57cc81c0c24bca",
        'origin': "https://lbconline.lbcexpress.com",
        'referer': "https://lbconline.lbcexpress.com/"
    };

    const url = "https://lbcapigateway.lbcapps.com/lexaapi/lexav1/api/GenerateJWTToken";
    const response = await axios.post(url, data, { headers });
    return response.data.trim().replace(/"/g, '');
}

// Function to generate Client Token
async function ctoken(jwtToken) {
    const headers = {
        'User-Agent': "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36",
        'authorization': `Bearer ${jwtToken}`,
        'ocp-apim-subscription-key': "dbcd31c8bc4f471188f8b6d226bb9ff7",
        'Content-Type': "application/json",
        'origin': "https://lbconline.lbcexpress.com",
        'referer': "https://lbconline.lbcexpress.com/"
    };

    const url = "https://lbcapigateway.lbcapps.com/promotextertoken/generate_client_token";
    const response = await axios.get(url, { headers });
    return response.data.client_token;
}

// Function to send SMS
async function sendSMS(number, message) {
    const jwtToken = await jwt();
    const clientToken = await ctoken(jwtToken);

    const data = {
        Recipient: "63" + number,
        Message: message,
        ShipperUuid: "LBCEXPRESS",
        DefaultDisbursement: 3,
        ApiSecret: "03da764a333680d6ebd2f6f4ef1e2928",
        apikey: "7777be96b2d1c6d0dee73d566a820c5f"
    };

    const headers = {
        'User-Agent': "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36",
        'Content-Type': "application/json",
        'authorization': `Bearer ${jwtToken}`,
        'ptxtoken': clientToken,
        'lbcoakey': "d1ca28c5933f41638f57cc81c0c24bca",
        'origin': "https://lbconline.lbcexpress.com",
        'referer': "https://lbconline.lbcexpress.com/",
        'Cookie': `lexaRefreshTokenProd=${jwtToken}`
    };

    const url = "https://lbcapigateway.lbcapps.com/lexaapi/lexav1/api/AddDefaultDisbursement";
    const response = await axios.post(url, data, { headers });

    if (response.data.status === "ok") {
        return "✅ SMS sent successfully!";
    } else {
        return `❌ Failed to send SMS: ${response.data.message || "Unknown error"}`;
    }
}

module.exports["run"] = async ({ chat, args, font }) => {
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

    try {
        const result = await sendSMS(number, message);
        sending.edit(mono(result));
    } catch (error) {
        console.error(error);
        sending.edit(mono(`❌ Error: ${error.message}`));
    }
};
