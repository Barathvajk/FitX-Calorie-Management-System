const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.json());

// Dummy data (in-memory database)
let foods = [
  {
    id: 1,
    name: "Pizza",
    description: "Delicious Italian dish",
    calories: 1200,
    protein: 30,
    carbs: 150,
  },
  {
    id: 2,
    name: "Burger",
    description: "Classic fast food",
    calories: 800,
    protein: 20,
    carbs: 50,
  },
];

// Default route for the root path
app.get("/", (req, res) => {
  res.send("Welcome to the Food API");
});

// Routes
app.get("/foods", (req, res) => {
  res.json(foods);
});

app.get("/foods/:id", (req, res) => {
  const foodId = parseInt(req.params.id);
  const food = foods.find((item) => item.id === foodId);

  if (!food) {
    return res.status(404).json({ error: "Food not found" });
  }

  res.json(food);
});

app.post("/foods", (req, res) => {
  const { name, description, calories, protein, carbs } = req.body;

  if (!name || !description || !calories || !protein || !carbs) {
    return res.status(400).json({
      error:
        "All fields (name, description, calories, protein, carbs) are required.",
    });
  }

  const newFood = {
    id: foods.length + 1,
    name,
    description,
    calories,
    protein,
    carbs,
  };
  foods.push(newFood);
  res.status(201).json(newFood);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
