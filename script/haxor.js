const axios = require('axios');
const { parse } = require('url');

module.exports["config"] = {
  name: 'haxor',
  aliases: ['hax', 'haxorid'],
  version: '1.0.0',
  role: 0,
  credits: 'reiko seikiro also known as atomic-zero and kenneth panio',
  info: 'Grab sites from hax.or.id',
  type: 'tools',
  usage: '[FirstPage - LastPage]',
  guide: 'haxor 1 - 2',
  cd: 10,
};

module.exports["run"] = async function({ chat, event, args, font, global }) {
  var mono = txt => font.monospace(txt);
  const [startPage, endPage] = args.join("").split('-');

  if (!startPage || !endPage) {
    chat.reply(mono(`Please use the correct usage.\nExample: !haxor 1 - 2`));
    return;
  }

  const start = parseInt(startPage);
  const end = parseInt(endPage);

  if (isNaN(start) || isNaN(end) || start > end) {
    chat.reply(font.italic('Invalid number.'));
    return;
  }

  try {
    const urls = await startGrab(start, end, global);
    const link = urls.join('\n');

    let message = font.bold(`Vulnerable Sites:`) + `\n\nRemove ()\n\n${link}\n\nPage: ${start} to ${end}`;

    chat.reply(message);
  } catch (error) {
    chat.reply(mono(error.message));
  }
};

const startGrab = async (firstPage, lastPage, global = global) => {
  const mainUrl = global.api["pentest"][0];
  const urls = [];

  for (let page = firstPage; page <= lastPage; page++) {
    const url = mainUrl + page;
    const response = await axios.get(url);
    const links = response.data.match(/<a[^>]+href=["'](https?:\/\/[^"']+)["'][^>]*>/gi);

    links.forEach((link) => {
      const href = link.match(/href=["'](https?:\/\/[^"']+)["']/i)[1];
      const parsedUrl = parse(href);
      const safeUrl = parsedUrl.protocol + '//' + parsedUrl.host.replace(/\./g, '(.)') + '/';
      urls.push(safeUrl);
    });
  }

  return urls;
};
