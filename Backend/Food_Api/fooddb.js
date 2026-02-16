const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const path = require("path");

const app = express();
const port = 3000; // Change to your desired port

// MySQL Connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "mysqlworkbench24",
  database: "mydb", // Replace with your MySQL database name
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL database:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

// Middleware
app.use(bodyParser.json());
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname,"public", "index.html"));
});
// Route to add food data to the database
app.post("/addFood", (req, res) => {
  const { foodName, calories, protein, fat, carbs, mealName, servingQuantity } =
    req.body;

  // Insert data into the database
  const sql = `INSERT INTO food_details (food_name, calories, protein, fat, carbs, meal_name, serving_quantity) 
               VALUES (?, ?, ?, ?, ?, ?, ?)`;
  const values = [
    foodName,
    calories,
    protein,
    fat,
    carbs,
    mealName,
    servingQuantity,
  ];

  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error inserting data into MySQL database:", err);
      res.status(500).json({ success: false });
      return;
    }
    console.log("Food data inserted into MySQL database");
    res.json({ success: true });
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
