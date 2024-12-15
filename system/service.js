const axios = require('axios');

const { workers } = require("./workers");

async function kokoro(req, res) {
    const hajime = await workers();
    const senderID = req.query.uid || Date.now();
    const query = req.query.prompt;

    if (!query) {
        return res.status(400).json({
            error: "No prompt provided"
        });
    }

    try {
        const response = await axios.get(hajime.api.kokoro[0] + `/google?prompt=${query}&uid=${senderID}`);
        res.json(response.data);
    } catch (error) {
        const errorMessage = error.response && error.response.data && error.response.data.error
            ? error.response.data.error
            : error.message;

        res.status(500).json({
            error: errorMessage
        });
    }
}

module.exports = {
    kokoro
};
