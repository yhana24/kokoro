const axios = require('axios');

module.exports["config"] = {
  name: "github",
  aliases: ["gh", "github-info"],
  usage: "[repo/user] [repositoryname/username]",
  info: "Interact with GitHub: get repository information, user details, etc.",
  guide: "Use github <command> [query] to interact with GitHub.",
  type: "Programming",
  credits: "Kenneth Panio",
  version: "1.0.0",
  role: 0,
};

module.exports["run"] = async ({ api, event, args, chat, font }) => {
  const command = args[0];
  const query = args.slice(1).join(' ');

  switch (command) {
    case "repo":
      if (!query) {
        return chat.reply(font.monospace('Please provide the name of the repository.'));
      }
      try {
        const response = await axios.get(`https://api.github.com/repos/${query}`);
        const repoData = response.data;
        const repoInfo = `Repository: ${repoData.full_name}\nDescription: ${repoData.description || "No description"}\nLanguage: ${repoData.language || "Unknown"}\nStars: ${repoData.stargazers_count}\nForks: ${repoData.forks_count}\nHomepage: ${repoData.homepage || "Not specified"}\nURL: ${repoData.html_url}`;
        chat.reply(font.monospace(repoInfo));
      } catch (error) {
        chat.reply(font.monospace(`Error fetching repository information: ${error.message}`));
      }
      break;

    case "user":
      if (!query) {
        return chat.reply(font.monospace('Please provide the GitHub username.'));
      }
      try {
        const response = await axios.get(`https://api.github.com/users/${query}`);
        const userData = response.data;
        const userInfo = `Username: ${userData.login}\nName: ${userData.name || "Not available"}\nBio: ${userData.bio || "Not available"}\nFollowers: ${userData.followers}\nFollowing: ${userData.following}\nPublic Repos: ${userData.public_repos}\nURL: ${userData.html_url}`;
        chat.reply(font.monospace(userInfo));
      } catch (error) {
        chat.reply(font.monospace(`Error fetching user information: ${error.message}`));
      }
      break;

    default:
      chat.reply(font.monospace('Invalid GitHub command. Available commands: repo, user'));
  }
};
