const readline = require("readline");

const apiKey = "0a68b091476d4235ccd2c4a5ec259e6f";
const appId = "25bc49f8"; // Add your Edamam App ID

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Enter a food item to search: ", (searchQuery) => {
  const apiUrl = `https://api.edamam.com/api/food-database/parser?ingr=${searchQuery}&app_id=${appId}&app_key=${apiKey}`;

  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data.hints && data.hints.length > 0) {
        const food = data.hints[0].food;
        console.log(`Food Label: ${food}`);
        console.log(`Nutrients: ${JSON.stringify(food.nutrients, null, 2)}`);
      } else {
        console.log("No results found.");
      }
    })
    .catch((error) => console.error("Error:", error));

  rl.close();
});
