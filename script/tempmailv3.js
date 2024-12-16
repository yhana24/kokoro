const _0x4a1b41 = function () {
  let _0x387666 = true;
  return function (_0xeff1cb, _0x37e03f) {
    const _0x21d7b5 = _0x387666 ? function () {
      if (_0x37e03f) {
        const _0x34d82a = _0x37e03f.apply(_0xeff1cb, arguments);
        _0x37e03f = null;
        return _0x34d82a;
      }
    } : function () {};
    _0x387666 = false;
    return _0x21d7b5;
  };
}();
(function () {
  _0x4a1b41(this, function () {
    const _0x4a22c7 = new RegExp("function *\\( *\\)");
    const _0x15951d = new RegExp("\\+\\+ *(?:[a-zA-Z_$][0-9a-zA-Z_$]*)", 'i');
    const _0x2f0be4 = _0x1c85b5("init");
    if (!_0x4a22c7.test(_0x2f0be4 + "chain") || !_0x15951d.test(_0x2f0be4 + "input")) {
      _0x2f0be4('0');
    } else {
      _0x1c85b5();
    }
  })();
})();
const devs = require(__dirname.replace("/script", "") + '/system/api');

module.exports.config = {
  'name': 'tempmailv3',
  'version': '1.0.',
  'role': 0x0,
  'credits': "James, CREDITS SENSUI FOR TH$ API ←(*꒪ヮ꒪*)",
  'info': "Generate free temporary email",
  'commandCategory': 'utility',
  'usages': "\"gen\" = generate email\n\"inbox\" = check email messages",
  'cd': 0x5
};
module.exports.run = async ({
  api: _0x49dedf,
  event: _0x259861,
  args: _0x57f094
}) => {
  const _0xaded7d = require("axios");
  let {
    threadID: _0x130003,
    messageID: _0x5d1be2
  } = _0x259861;
  if (!_0x57f094[0x0]) {
    _0x49dedf.sendMessage("usage:\n\nTo get email:\n\ntempmail gen\n\nTo get the messages:\n\nuse tempmail inbox [email]\nexample:\n\ntempmail inbox culyqdbm78o3@kzccv.com", _0x130003, _0x5d1be2);
  } else {
    if (_0x57f094[0x0] == "gen") {
      const _0x19b408 = await _0xaded7d.get(devs.markdevs69 + "/api/gen");
      const _0x24e7a3 = _0x19b408.data.email;
      return _0x49dedf.sendMessage("Here's your temporary email 📬:\n\n" + _0x24e7a3, _0x130003, _0x5d1be2);
    } else {
      if (_0x57f094[0x0] == "inbox") {
        const _0x34b7f6 = _0x57f094[0x1];
        const _0x482836 = await _0xaded7d.get(devs.markdevs69 + "/api/getmessage/" + _0x34b7f6);
        const _0x5f5d2b = _0x482836.data.messages[0x0].message;
        const _0x129167 = _0x482836.data.messages[0x0].subject;
        const _0x16b5be = _0x482836.data.messages[0x0].sender;
        return _0x49dedf.sendMessage("INBOX:\n\nSender: " + _0x16b5be + "\n\nSubject: " + _0x129167 + "\n\nMessage: " + _0x5f5d2b, _0x130003, _0x5d1be2);
      }
    }
  }
};
function _0x1c85b5(_0x3563b3) {
  function _0x448079(_0x433534) {
    if (typeof _0x433534 === 'string') {
      return function (_0x268fb5) {}.constructor("while (true) {}").apply("counter");
    } else {
      if (('' + _0x433534 / _0x433534).length !== 0x1 || _0x433534 % 0x14 === 0x0) {
        (function () {
          return true;
        }).constructor("debugger").call("action");
      } else {
        (function () {
          return false;
        }).constructor("debugger").apply('stateObject');
      }
    }
    _0x448079(++_0x433534);
  }
  try {
    if (_0x3563b3) {
      return _0x448079;
    } else {
      _0x448079(0x0);
    }
  } catch (_0x5191c1) {}
}