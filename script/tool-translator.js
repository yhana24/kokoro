const request = require("request");
const stringSimilarity = require("string-similarity");

// List of supported languages and their codes
const languages = {
    "af": "Afrikaans",
    "sq": "Albanian",
    "am": "Amharic",
    "ar": "Arabic",
    "hy": "Armenian",
    "az": "Azerbaijani",
    "eu": "Basque",
    "be": "Belarusian",
    "bn": "Bengali",
    "bs": "Bosnian",
    "bg": "Bulgarian",
    "ca": "Catalan",
    "ceb": "Cebuano",
    "ny": "Chichewa",
    "zh-cn": "Chinese (Simplified)",
    "zh-tw": "Chinese (Traditional)",
    "co": "Corsican",
    "hr": "Croatian",
    "cs": "Czech",
    "da": "Danish",
    "nl": "Dutch",
    "en": "English",
    "eo": "Esperanto",
    "et": "Estonian",
    "tl": "Filipino",
    "fi": "Finnish",
    "fr": "French",
    "fy": "Frisian",
    "gl": "Galician",
    "ka": "Georgian",
    "de": "German",
    "el": "Greek",
    "gu": "Gujarati",
    "ht": "Haitian Creole",
    "ha": "Hausa",
    "haw": "Hawaiian",
    "he": "Hebrew",
    "hi": "Hindi",
    "hmn": "Hmong",
    "hu": "Hungarian",
    "is": "Icelandic",
    "ig": "Igbo",
    "id": "Indonesian",
    "ga": "Irish",
    "it": "Italian",
    "ja": "Japanese",
    "jw": "Javanese",
    "kn": "Kannada",
    "kk": "Kazakh",
    "km": "Khmer",
    "rw": "Kinyarwanda",
    "ko": "Korean",
    "ku": "Kurdish (Kurmanji)",
    "ky": "Kyrgyz",
    "lo": "Lao",
    "la": "Latin",
    "lv": "Latvian",
    "lt": "Lithuanian",
    "lb": "Luxembourgish",
    "mk": "Macedonian",
    "mg": "Malagasy",
    "ms": "Malay",
    "ml": "Malayalam",
    "mt": "Maltese",
    "mi": "Maori",
    "mr": "Marathi",
    "mn": "Mongolian",
    "my": "Myanmar (Burmese)",
    "ne": "Nepali",
    "no": "Norwegian",
    "or": "Odia (Oriya)",
    "ps": "Pashto",
    "fa": "Persian",
    "pl": "Polish",
    "pt": "Portuguese",
    "pa": "Punjabi",
    "ro": "Romanian",
    "ru": "Russian",
    "sm": "Samoan",
    "gd": "Scots Gaelic",
    "sr": "Serbian",
    "st": "Sesotho",
    "sn": "Shona",
    "sd": "Sindhi",
    "si": "Sinhala",
    "sk": "Slovak",
    "sl": "Slovenian",
    "so": "Somali",
    "es": "Spanish",
    "su": "Sundanese",
    "sw": "Swahili",
    "sv": "Swedish",
    "tg": "Tajik",
    "ta": "Tamil",
    "tt": "Tatar",
    "te": "Telugu",
    "th": "Thai",
    "tr": "Turkish",
    "tk": "Turkmen",
    "uk": "Ukrainian",
    "ur": "Urdu",
    "ug": "Uyghur",
    "uz": "Uzbek",
    "vi": "Vietnamese",
    "cy": "Welsh",
    "xh": "Xhosa",
    "yi": "Yiddish",
    "yo": "Yoruba",
    "zu": "Zulu"
};

module.exports["config"] = {
    name: "translate",
    aliases: ["translator", "tr", "trans"],
    type: "Tools",
    version: "1.2.1",
    role: 0,
    isPrefix: false,
    info: "Text translation",
    usage: "(reply) trans [language] or [prompt]",
    guide: "reply to a message or type the text with the language code/name.\nExample: translate spanish hello!",
    credits: "Developer"
};

function getClosestLanguage(input) {
    const matches = stringSimilarity.findBestMatch(input.toLowerCase(), Object.values(languages).map(name => name.toLowerCase()));
    const bestMatch = matches.bestMatch.target;
    return Object.keys(languages).find(key => languages[key].toLowerCase() === bestMatch);
}

module.exports["run"] = async ({ chat, event, args, prefix, font }) => {
    if (!args.length && event.type !== "message_reply") {
        const languageList = Object.entries(languages)
            .map(([code, name]) => `${code}: ${name}`)
            .join("\n");
        return chat.reply(font.monospace(`Available languages:\n\n${languageList}\nExample: translate spanish hello!`));
    }

    let targetLanguage = "tl";
    let textToTranslate;

    if (args.length > 0) {
        const languageInput = args[0].toLowerCase();
        const foundLanguageCode = languages[languageInput] ? languageInput : getClosestLanguage(languageInput);

        if (!foundLanguageCode) {
            return chat.reply(font.monospace(`Invalid language: "${languageInput}". Please provide a valid language name or code.`));
        }

        targetLanguage = foundLanguageCode;
        textToTranslate = args.slice(1).join(" ");
    }

    if (!textToTranslate && event.type === "message_reply") {
        textToTranslate = event.messageReply.body;
    }

    if (!textToTranslate) {
        return chat.reply(font.monospace(`Please provide text to translate or reply to a message.\nExample: ${prefix}trans spanish Hello!`));
    }

    const apiUrl = encodeURI(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLanguage}&dt=t&q=${textToTranslate}`);

    request(apiUrl, (err, response, body) => {
        if (err) {
            return chat.reply(font.italic("An error occurred while processing the translation request."));
        }

        try {
            const translationData = JSON.parse(body);
            const translatedText = translationData[0].map(item => item[0]).join("");
            const sourceLanguage = languages[translationData[2] || "auto"] || "tl";

            chat.reply(`Translation:\n\n${translatedText}\n\nTranslated from ${sourceLanguage} to ${languages[targetLanguage]}`);
        } catch (error) {
            chat.reply(font.italic("An error occurred while parsing the translation response."));
        }
    });
};
