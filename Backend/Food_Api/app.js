const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const port = 3000;

// Create connection to MySQL database
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "mysqlworkbench24",
  database: "mydb",
});

// Connect to database
db.connect((err) => {
  if (err) throw err;
  console.log("Connected to database");
});

// Set up body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve static files
app.use(express.static("public"));

// Route handler for root URL (food search page)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Route to handle search and fetch food details
app.post("/search", (req, res) => {
  const searchedFood = req.body.search;

  // Query to fetch food details
  const sql = `SELECT * FROM fooddata WHERE foodname LIKE '%${searchedFood}%'`;

  // Execute query
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

// Route to handle adding food details to the food_details table
app.post("/addFood", (req, res) => {
  const { foodName, calories, protein, fat, carbs, mealName, servingQuantity } =
    req.body;

  // Insert data into the food_details table
  const sql = `INSERT INTO food_details (food_name, calories, protein, fat, carbs, meal_name, serving_quantity, created_at) 
               VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`; // NOW() function to insert current timestamp
  const values = [
    foodName,
    calories,
    protein,
    fat,
    carbs,
    mealName,
    servingQuantity,
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error inserting data into MySQL database:", err);
      res.status(500).json({ success: false, error: "Database error" });
      return;
    }
    console.log("Food data inserted into MySQL database");
    res.json({ success: true });
  });
});

// Route handler for the insight page
app.get("/insight", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "insight.html"));
});

// Route to fetch food data for the insight page
app.get("/fetchFoodData", (req, res) => {
  const sql = "SELECT * FROM food_details";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching food data:", err);
      res.status(500).json({ success: false, error: "Database error" });
      return;
    }
    res.json(result);
  });
});

app.post('/calorie', (req, res) => {
  const { calorieChange, breakfastCalories, lunchCalories, snackCalories, dinnerCalories } = req.body;

  // You can fetch daily calorie goal here if needed

  // Assuming you have a table named `calories` to store the calorie data
  const sql = 'INSERT INTO calories (calorie_change, breakfast_calories, lunch_calories, snack_calories, dinner_calories) VALUES (?, ?, ?, ?, ?)';
  const values = [calorieChange, breakfastCalories, lunchCalories, snackCalories, dinnerCalories];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error inserting data into MySQL database:', err);
      res.status(500).json({ success: false, error: 'Database error' });
      return;
    }
    console.log('Calorie data inserted into MySQL database');
    res.json({ success: true });
  });
});


app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
