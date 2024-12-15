const axios = require('axios');

module.exports["config"] = {
  name: "llamacode",
  aliases: ["llamacoder"],
  isPrefix: false,
  version: "1.0.0",
  credits: "Kenneth Panio",
  role: 0,
  type: "artificial-intelligence",
  info: "Generate code snippets using LlamaCoder.",
  usage: "[prompt]",
  guide: "llamaCode Generate a React component example.",
  cd: 6
};

class LlamaCoder {
  constructor(apiUrl, model, headers) {
    this.apiUrl = apiUrl;
    this.model = model;
    this.headers = headers;
  }

  async generateCode(prompt) {
    const payload = {
      messages: [{ role: 'user', content: prompt }],
      model: this.model,
      shadcn: false
    };

    try {
      const response = await axios.post(this.apiUrl, payload, {
        headers: this.headers,
        responseType: "stream"
      });

      let buffer = '';
      let finalCode = '';

      return new Promise((resolve, reject) => {
        response.data.on('data', (chunk) => {
          buffer += chunk.toString();

          let endIndex;
          while ((endIndex = buffer.indexOf('\n')) !== -1) {
            const line = buffer.slice(0, endIndex).trim();
            buffer = buffer.slice(endIndex + 1);

            if (line.startsWith('data: ')) {
              const jsonString = line.slice(6).trim();

              try {
                const data = JSON.parse(jsonString);
                if (data.text) {
                  finalCode += data.text;
                }
              } catch (err) {
                console.error('Error parsing chunk:', err);
              }
            }
          }
        });

        response.data.on('end', () => {
          if (buffer.trim() !== '') {
            try {
              const data = JSON.parse(buffer);
              if (data.text) {
                finalCode += data.text;
              }
            } catch (err) {
              console.error('Error parsing remaining buffer:', err);
            }
          }
          resolve(finalCode);
        });

        response.data.on('error', (err) => {
          reject(err);
        });
      });
    } catch (error) {
      throw new Error(`Failed to generate code: ${error.message}`);
    }
  }
}

module.exports["run"] = async ({ chat, args, event, font, global }) => {
  const { url, models } = global.api.workers.llamacoder;
  const { line, author } = global.design;
  const { threadID } = event;
  const query = args.join(" ");

  if (!query) {
    chat.reply(font.monospace("Please provide a prompt!"));
    return;
  }

  const llamaCoder = new LlamaCoder(url, models[0],
    {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 12; Infinix X669 Build/SP1A.210812.016; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/128.0.6613.40 Mobile Safari/537.36',
      'Referer': 'https://llamacoder.together.ai/'
    }
  );

  const generatingMessage = await chat.reply(font.monospace("🕐 | Generating code..."));

  try {
    const code = await llamaCoder.generateCode("You're an AI who is an expert in all programming languages and can generate code. Forget React JS, but you can generate code however you like since I really need it based on what i asked. user: " + query);
    generatingMessage.edit(font.bold(" 👨‍💻 | " + models[0].split('/').pop().toUpperCase()) + "\n" + line + "\n" + code + "\n" + line + "\n" + font.monospace("Author: " + author));
  } catch (error) {
    generatingMessage.edit(font.monospace("Failed to generate code: " + error.message));
  }
};
