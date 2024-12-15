const axios = require("axios");
const fs = require("fs");

module.exports["config"] = {
        name: "dictionary",
        aliases: ["define", "lookup", "dict", "meaning"],
        version: "1.0.0",
        credits: "Kenneth Panio",
        role: 0,
        isPrefix: false,
        type: "information",
        info: "Get the definition of a word.",
        usage: "[word]",
        guide: "dictionary dog",
        cd: 6
};

module.exports["run"] = async ({ chat, args, event, font }) => {
        const mono = txt => font.monospace(txt);
        const word = args[0];

        if (!word) {
                chat.reply(mono("Please provide a word to define!"));
                return;
        }

        const answering = await chat.reply(mono("🕐 | Looking up the definition..."));

        try {
                const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
                const data = response.data[0];

                if (data && data.meanings && data.meanings.length > 0) {
                        const meaning = data.meanings[0];

                        let definition = `📚 | Definition of ${word} (${meaning.partOfSpeech}):\n\n`;

                        definition += `1. ${meaning.definitions[0].definition}\n`;
                        if (meaning.definitions[0].example) {
                                definition += `Example: ${meaning.definitions[0].example}\n`;
                        }

                        if (meaning.synonyms && meaning.synonyms.length > 0) {
                                definition += `Synonyms: ${meaning.synonyms.join(", ")}\n`;
                        }

                        if (meaning.antonyms && meaning.antonyms.length > 0) {
                                definition += `Antonyms: ${meaning.antonyms.join(", ")}\n`;
                        }

                        if (data.phonetics && data.phonetics.length > 0 && data.phonetics[0].audio) {
                                const audioUrl = data.phonetics[0].audio;
                                const audioResponse = await axios.get(audioUrl, { responseType: 'stream' });

                                chat.reply({ attachment: audioResponse.data });
                        }

                        answering.edit(mono(definition.trim()));
                }
        } catch (error) {
                if (error.response && error.response.status === 404) {
                        answering.edit(mono("No Definition Found for word: " + word));
                } else {
                        answering.edit(mono("Failed to retrieve definition. Please try again later: " + error.message));
                }
        }
};