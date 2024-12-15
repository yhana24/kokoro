
const axios = require('axios');

module.exports["config"] = {
    name: 'ygo',
    aliases: ["deck", "card-deck", "deck-card", "yugi", "yugioh"],
    version: '1.1.5',
    role: 0,
    credits: 'Reiko Dev Also Known as Kenneth Panio',
    info: 'Get information about a specific Yu-Gi-Oh card deck',
    type: 'fun',
    usage: '[name]',
    cd: 5,
};

module.exports["run"] = async function ({ event, args, chat }) {
    const { threadID, messageID } = event;
    const cardName = args.join(' ').trim();
    try {
        const apiUrl = cardName ? `https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(cardName)}` : 'https://db.ygoprodeck.com/api/v7/randomcard.php';
        const response = await axios.get(apiUrl);
        const card = response.data.data[0];

        if (card) {
            const imageUrl = card.card_images[0].image_url;
            const imageResponse = await axios.get(imageUrl, { responseType: 'stream' });

            const attachment = {
                body: `𝗡𝗔𝗠𝗘: ${card.name || '?'}\n𝗧𝗬𝗣𝗘: ${card.type || '?'}\n𝗗𝗘𝗦𝗖𝗥𝗜𝗣𝗧𝗜𝗢𝗡: ${card.desc || '?'}\n𝗔𝗧𝗞: ${card.atk || '?'}\n𝗗𝗘𝗙: ${card.def || '?'}\n𝗟𝗘𝗩𝗘𝗟: ${card.level || '?'}\n𝗥𝗔𝗖𝗘: ${card.race || '?'}\n𝗔𝗧𝗧𝗥𝗜𝗕𝗨𝗧𝗘: ${card.attribute || '?'}\n𝗔𝗥𝗖𝗛𝗘𝗧𝗬𝗣𝗘: ${card.archetype || '?'}\n\n𝗖𝗔𝗥𝗗 𝗦𝗘𝗧𝗦:\n${formatCardSets(card.card_sets || [])}\n\n𝗖𝗔𝗥𝗗 𝗣𝗥𝗜𝗖𝗘𝗦:\n${formatCardPrices(card.card_prices || [])}`,
                attachment: imageResponse.data
            };

            chat.reply(attachment);
        } else {
            chat.reply('No card data found!');
        }
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return chat.reply("Not Found : <");
        }
        chat.reply(error.message);
    }
};

function formatCardSets(cardSets) {
    return cardSets.map((set) => `${set.set_name} (${set.set_rarity}): ${set.set_price}`).join('\n') || 'No sets available';
}

function formatCardPrices(cardPrices) {
    return cardPrices.map((price) => `𝗖𝗔𝗥𝗗𝗠𝗔𝗥𝗞𝗘𝗧: ${price.cardmarket_price || 'N/A'}\n𝗧𝗖𝗚𝗣𝗟𝗔𝗬𝗘𝗥: ${price.tcgplayer_price || 'N/A'}\n𝗘𝗕𝗔𝗬: ${price.ebay_price || 'N/A'}\n𝗔𝗠𝗔𝗭𝗢𝗡: ${price.amazon_price || 'N/A'}`).join('\n') || 'No prices available';
}
