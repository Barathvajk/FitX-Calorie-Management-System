// app.js

const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

let foodData = []; // Array to store food data

app.use(bodyParser.json());

// Serve static files (e.g., CSS, JS, images)
app.use(express.static("public"));

// Endpoint to serve the insight page
app.get("/insight", (req, res) => {
  res.sendFile(__dirname + "/insight.html");
});

// Endpoint to fetch food data
app.get("/fetchFoodData", (req, res) => {
  res.json(foodData);
});

// Endpoint to add food data
app.post("/addFood", (req, res) => {
  const newFood = req.body;
  foodData.push(newFood);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
