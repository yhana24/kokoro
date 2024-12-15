const axios = require('axios');
module.exports["config"] = {
  name: "recipe",
  version: "1.0.0",
  role: 0,
  info: "Get a random recipe.",
  credits: "Developer",
  cd: 10
};
module.exports["run"] = async function ({
  api,
  event,
  chat
}) {
  const {
    threadID,
    messageID
  } = event;
  try {
    const response = await axios.get('https://www.themealdb.com/api/json/v1/1/random.php');
    const recipe = response.data.meals[0];
    const {
      strMeal: title,
      strCategory: category,
      strArea: area,
      strInstructions: instructions,
      strMealThumb: thumbnail,
      strYoutube: youtubeLink
    } = recipe;
    const recipeMessage = `
        Title: ${title}
        Category: ${category}
        Area: ${area}
        Instructions: ${instructions}
        ${youtubeLink ? "YouTube Link: " + youtubeLink : ""}
        `;
    chat.reply(recipeMessage);
  } catch (error) {
    chat.reply("Sorry, I couldn't fetch a recipe at the moment. Please try again later.");
  }
};