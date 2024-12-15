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
    "iw": "Hebrew",
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
    aliases: ['translator',
        'tr',
        'trans'],
    type: 'Tools',
    version: "1.2.0",
    role: 0,
    isPrefix: false,
    info: "Text translation",
    usage: "(reply) trans [language] or [prompt]",
    guide: "reply to message you want to translate\n\ntranslate [language] > message: hello > kamusta\ntrans [language] > message: kamusta > hello",
    credits: "Developer",
};

function getClosestLanguage(input) {
    const availableLanguages = Object.values(languages);
    const matches = stringSimilarity.findBestMatch(input, availableLanguages);
    const bestMatch = matches.bestMatch.target;
    return Object.keys(languages).find(key => languages[key] === bestMatch);
}

module.exports["run"] = async ({
    chat, event, args, prefix, font
}) => {
    if (args.length === 0 && event.type !== "message_reply") {
        const languageList = Object.entries(languages)
        .map(([code, name]) => `${code}: ${name}`)
        .join('\n');
        return chat.reply(font.monospace(`Available languages:\n\n${languageList}\nExample: translate japanese i love you!`));
    }

    let targetLanguage = 'tl';

    if (args.length > 0) {
        const inputPhrase = args.join(" ").toLowerCase();
        const toLanguageMatch = inputPhrase.match(/to (\w+)/);

        const inputLanguage = toLanguageMatch ? toLanguageMatch[1]: args[0].toLowerCase();

        targetLanguage = languages[inputLanguage] ? inputLanguage: getClosestLanguage(inputLanguage);

        if (!languages[inputLanguage] && !targetLanguage) {
            return chat.reply(font.monospace(`Could not find a matching language for "${args[0]}". Please provide a valid language code or name.`));
        }
    }

    let content;
    if (toLanguageMatch) {
        const contentStartIndex = toLanguageMatch.index + toLanguageMatch[0].length;
        content = inputPhrase.slice(contentStartIndex).trim();
    } else {
        content = args.slice(1).join(" ");
    }

    if (content.length === 0 && event.type !== "message_reply") {
        return chat.reply(font.monospace(`Please provide text to translate or reply to a message.\n\nExample: ${prefix}trans ${targetLanguage} what is life`));
    }

    let translateThis;
    if (event.type === "message_reply") {
        translateThis = font.origin(event.messageReply.body);
    } else {
        translateThis = font.origin(content);
    }

    try {
        const apiUrl = encodeURI(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLanguage}&dt=t&q=${translateThis}`);
        request(apiUrl, (err, response, body) => {
            if (err) {
                return chat.reply(font.italic("An error has occurred while processing the request."));
            }

            try {
                const retrieve = JSON.parse(body);
                let translatedText = '';
                retrieve[0].forEach(item => {
                    if (item[0]) translatedText += item[0];
                });
                const fromLang = retrieve[2] || retrieve[8][0][0];
                chat.reply(`Translation: \n\n${translatedText}\n\n- Translated from ${fromLang} to ${targetLanguage}`);
            } catch (parseError) {
                chat.reply(font.italic("An error has occurred while parsing the translation response."));
            }
        });
    } catch (error) {
        chat.reply(font.italic("An unexpected error has occurred."));
    }
};