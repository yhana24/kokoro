(function(self) {
    const MIN = 32,
          MAX = 126;

    const SIMPLE = {
        'false': '![]',
        'true': '!![]',
        'undefined': '[][[]]',
        'NaN': '+[![]]',
        'Infinity': '+(+!+[]+(!+[]+[])[!+[]+!+[]+!+[]]+[+!+[]]+[+[]]+[+[]]+[+[]])' // +"1e1000"
    };

    const CONSTRUCTORS = {
        'Array': '[]',
        'Number': '(+[])',
        'String': '([]+[])',
        'Boolean': '(![])',
        'Function': '[]["flat"]',
        'RegExp': 'Function("return/"+false+"/")()',
        'Object': '[]["entries"]()'
    };

    const MAPPING = {
        'a': '(false+"")[1]',
        'b': '([]["entries"]()+"")[2]',
        'c': '([]["flat"]+"")[3]',
        'd': '(undefined+"")[2]',
        'e': '(true+"")[3]',
        'f': '(false+"")[0]',
        'g': '(false+[0]+String)[20]',
        'h': '(+(101)) [1]',
        'i': '([false]+undefined)[10]',
        'j': '([]["entries"]()+"")[3]',
        'k': '(+(20)) ',
        'l': '(false+"")[2]',
        'm': '(Number+"")[11]',
        'n': '(undefined+"")[1]',
        'o': '(true+[]["flat"])[10]',
        'p': '(+(211)) [1]',
        'q': '("")["fontcolor"]([0]+false+")[20]',
        'r': '(true+"")[1]',
        's': '(false+"")[3]',
        't': '(true+"")[0]',
        'u': '(undefined+"")[0]',
        'v': '(+(31)) ',
        'w': '(+(32)) ',
        'x': '(+(101)) [1]',
        'y': '(NaN+[Infinity])[10]',
        'z': '(+(35)) ',

        'A': '(NaN+[]["entries"]())[11]',
        'B': '(+[]+Boolean)[10]',
        'C': 'Function("return escape")()(("")["italics"]())[2]',
        'D': 'Function("return escape")()([]["flat"])["slice"]("-1")',
        'E': '(RegExp+"")[12]',
        'F': '(+[]+Function)[10]',
        'G': '(false+Function("return Date")()())[30]',
        'H': null,
        'I': '(Infinity+"")[0]',
        'J': null,
        'K': null,
        'L': null,
        'M': '(true+Function("return Date")()())[30]',
        'N': '(NaN+"")[0]',
        'O': '(+[]+Object)[10]',
        'P': null,
        'Q': null,
        'R': '(+[]+RegExp)[10]',
        'S': '(+[]+String)[10]',
        'T': '(NaN+Function("return Date")()())[30]',
        'U': '(NaN+Object()["to"+String["name"]]["call"]())[11]',
        'V': null,
        'W': null,
        'X': null,
        'Y': null,
        'Z': null,

        ' ': '(NaN+[]["flat"])[11]',
        '!': null,
        '"': '("")["fontcolor"]()[12]',
        '#': null,
        '$': null,
        '%': 'Function("return escape")()([]["flat"])[21]',
        '&': '("")["fontcolor"](")[13]',
        '\'': null,
        '(': '([]["flat"]+"")[13]',
        ')': '([0]+false+[]["flat"])[20]',
        '*': null,
        '+': '(+(+!+[]+(!+[]+[])[!+[]+!+[]+!+[]]+[+!+[]]+[+[]]+[+[]]+[+[]])+[])[2]',
        ',': '[[]]["concat"]([[]])+""',
        '-': '(+(.+[0000001])+"")[2]',
        '.': '(+(+!+[]+[+!+[]]+(!![]+[])[!+[]+!+[]+!+[]]+[!+[]+!+[]]+[+[]])+[])[+!+[]]',
        '/': '(false+[0])["italics"]()[10]',
        ':': '(RegExp()+"")[3]',
        ';': '("")["fontcolor"](NaN+")[21]',
        '<': '("")["italics"]()[0]',
        '=': '("")["fontcolor"]()[11]',
        '>': '("")["italics"]()[2]',
        '?': '(RegExp()+"")[2]',
        '@': null,
        '[': '([]["entries"]()+"")[0]',
        '\\': '(RegExp("/")+"")[1]',
        ']': '([]["entries"]()+"")[22]',
        '^': null,
        '_': null,
        '`': null,
        '{': '(true+[]["flat"])[20]',
        '|': null,
        '}': '([]["flat"]+"")["slice"]("-1")',
        '~': null
    };

    const GLOBAL = 'Function("return this")()';

    function fillMissingDigits() {
        var output, number, i;

        for (number = 0; number < 10; number++) {
            output = "+[]";
            if (number > 0) { output = "+!" + output; }
            for (i = 1; i < number; i++) { output = "+!+[]" + output; }
            if (number > 1) { output = output.substr(1); }
            MAPPING[number] = "[" + output + "]";
        }
    }

    function replaceMap() {
        var character = "",
            value, i, key;

        function replace(pattern, replacement) {
            value = value.replace(
                new RegExp(pattern, "gi"),
                replacement
            );
        }

        function digitReplacer(_, x) { return MAPPING[x]; }
        function numberReplacer(_, y) {
            var values = y.split("");
            var head = +(values.shift());
            var output = "+[]";

            if (head > 0) { output = "+!" + output; }
            for (i = 1; i < head; i++) { output = "+!+[]" + output; }
            if (head > 1) { output = output.substr(1); }

            return [output].concat(values).join("+").replace(/(\d)/g, digitReplacer);
        }

        for (i = MIN; i <= MAX; i++) {
            character = String.fromCharCode(i);
            value = MAPPING[character];
            if (!value) { continue; }

            for (key in CONSTRUCTORS) {
                replace("\\b" + key, CONSTRUCTORS[key] + '["constructor"]');
            }

            for (key in SIMPLE) {
                replace(key, SIMPLE[key]);
            }

            replace('(\\d\\d+)', numberReplacer);
            replace('\\((\\d)\\)', digitReplacer);
            replace('\\[(\\d)\\]', digitReplacer);

            replace("GLOBAL", GLOBAL);
            replace('\\+""', "+[]");
            replace('""', "[]+[]");

            MAPPING[character] = value;
        }
    }

    function replaceStrings() {
        var regEx = /[^\[\]\(\)\!\+]{1}/g,
            all, value, missing,
            count = MAX - MIN;

        function findMissing() {
            var all, value, done = false;
            missing = {};

            for (all in MAPPING) {
                value = MAPPING[all];
                if (value && value.match(regEx)) {
                    missing[all] = value;
                    done = true;
                }
            }

            return done;
        }

        function mappingReplacer(a, b) {
            return b.split("").join("+");
        }

        function valueReplacer(c) {
            return missing[c] ? c : MAPPING[c];
        }

        for (all in MAPPING) {
            if (MAPPING[all]) {
                MAPPING[all] = MAPPING[all].replace(/\"([^\"]+)\"/gi, mappingReplacer);
            }
        }

        while (findMissing()) {
            for (all in missing) {
                value = MAPPING[all];
                value = value.replace(regEx, valueReplacer);

                MAPPING[all] = value;
                missing[all] = value;
            }

            if (count-- === 0) {
                console.error("Could not compile the following chars:", missing);
            }
        }
    }

    function escapeSequence(c) {
        var cc = c.charCodeAt(0);
        if (cc < 256) {
            return '\\' + cc.toString(8);
        } else {
            var cc16 = cc.toString(16);
            return '\\u' + ('0000' + cc16).substring(cc16.length);  
        }
    }

    function escapeSequenceForReplace(c) {
        return escapeSequence(c).replace('\\', 't');
    }

    function encode(input, wrapWithEval, runInParentScope) {
        var output = [];

        if (!input) {
            return "";
        }

        var unmappped = '';
        for (var k in MAPPING) {
            if (MAPPING[k]) {
                unmappped += k;
            }
        }
        unmappped = unmappped.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        unmappped = new RegExp('[^' + unmappped + ']', 'g');
        var unmappedCharactersCount = (input.match(unmappped) || []).length;

        if (unmappedCharactersCount > 1) {
            input = input.replace(/[^0123456789.adefilnrsuN]/g, escapeSequenceForReplace);
        } else if (unmappedCharactersCount > 0) {
            input = input.replace(/["\\]/g, escapeSequence);
            input = input.replace(unmappped, escapeSequence);
        }

        var r = "";
        for (var i in SIMPLE) {
            r += i + "|";
        }
        r += ".";

        input.replace(new RegExp(r, 'g'), function(c) {
            var replacement = SIMPLE[c];
            if (replacement) {
                output.push("(" + replacement + "+[])");
            } else {
                replacement = MAPPING[c];
                if (replacement) {
                    output.push(replacement);
                } else {
                    throw new Error('Found unmapped character: ' + c);
                }
            }
        });

        output = output.join("+");

        if (/^\d$/.test(input)) {
            output += "+[]";
        }

        if (unmappedCharactersCount > 1) {
            output = "(" + output + ")[" + encode("split") + "](" + encode("t") + ")[" + encode("join") + "](" + encode("\\") + ")";
        }

        if (unmappedCharactersCount > 0) {
            output = "[][" + encode("flat") + "]" +
                "[" + encode("constructor") + "]" +
                "(" + encode("return\"") + "+" + output + "+" + encode("\"") + ")()";
        }

        if (wrapWithEval) {
            if (runInParentScope) {
                output = "[][" + encode("flat") + "]" +
                    "[" + encode("constructor") + "]" +
                    "(" + encode("return eval") + ")()" +
                    "(" + output + ")";
            } else {
                output = "[][" + encode("flat") + "]" +
                    "[" + encode("constructor") + "]" +
                    "(" + output + ")()";
            }
        }

        return output;
    }

    fillMissingDigits();
    replaceMap();
    replaceStrings();

    const JSFuck = {
        encode: encode
    };

    const fs = require('fs');
    const path = require('path');

    module.exports["config"] = {
        name: "jsfuck",
        aliases: ["jsf"],
        usage: "[code] or reply to a message with code",
        info: "Encrypt JavaScript code using JSFuck.",
        guide: "Use jsfuck [code] to encrypt JavaScript code or reply to a message with code.",
        type: "Programming",
        credits: "Kenneth Panio",
        version: "1.0.0",
        role: 0,
    };

    module.exports["run"] = async ({ event, args, chat, font }) => {
        let code;

        if (event.type === "message_reply" && event.messageReply.body) {
            code = event.messageReply.body;
        } else {
            if (args.length === 0) {
                return chat.reply(font.monospace('Please provide the code to encrypt.'));
            }
            code = args.join(' ');
        }

        try {
            const encryptedCode = JSFuck.encode(code, true, false);
            const cacheFolderPath = path.join(__dirname, 'cache');
            
            if (!fs.existsSync(cacheFolderPath)) {
                fs.mkdirSync(cacheFolderPath);
            }

            const numeric = Math.floor(Math.random() * 10000);
            const filePath = path.join(cacheFolderPath, `Jsfuck_${event.senderID}_${numeric}.txt`);
            fs.writeFileSync(filePath, "//Encrypted by Kenneth Panio\n\n" + encryptedCode, 'utf-8');
            
            const fileStream = fs.createReadStream(filePath);
            
            await chat.reply({ attachment: fileStream });
            fs.unlinkSync(filePath);
        } catch (error) {
            chat.reply(font.monospace(`Can't send attachment bot is temporary restricted from using this feature.`));
        }
    };

})(typeof(exports) === "undefined" ? window : exports);
