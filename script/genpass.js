module.exports["config"] = {
  name: 'genpass',
  version: '1.0.0',
  role: 0,
  credits: 'chilli',
  info: 'Generate random password base on length',
  usage: 'genpass [length]',
  aliases: [],
  cd: 5
};

function generatePassword(length) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
  }
  return password;
}

module.exports["run"] = ({ api, event, args }) => {
  const length = parseInt(args[0], 10);

  if (isNaN(length) || length < 1) {
      return api.sendMessage("Please provide a valid password length.", event.threadID, event.messageID);
  }

  const password = generatePassword(length);
  api.sendMessage(`${password}`, event.threadID, event.messageID);
};