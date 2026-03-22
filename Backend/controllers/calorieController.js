const Meal = require('../models/mealModel');
const { calculateRemainingCalories } = require('../utils/calorieCalculator');
const db = require('../config/db');

const addMeal = (req, res) => {
  const userId = req.user.id;
  const { meal_name, calories, protein, carbs, fats } = req.body;

  if (!meal_name || !calories) {
    return res.status(400).json({ message: 'Meal name and calories are required' });
  }

  Meal.create({ user_id: userId, meal_name, calories, protein, carbs, fats }, (err, result) => {
    if (err) return res.status(500).json({ message: err });

    res.status(201).json({ message: 'Meal added successfully' });
  });
};

const getSummary = (req, res) => {
  const userId = req.user.id;

  // Get goal calories from user table
  db.query('SELECT weight, height, age, activity_level FROM users WHERE id = ?', [userId], (err, userResults) => {
    if (err) return res.status(500).json({ message: err });
    if (userResults.length === 0) return res.status(404).json({ message: 'User not found' });

    const user = userResults[0];
    const goalCalories = 2000; // For now static; can calculate using BMR/TDEE later

    // Get total calories consumed today
    Meal.getTodayMeals(userId, (err, meals) => {
      if (err) return res.status(500).json({ message: err });

      const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
      const remainingCalories = calculateRemainingCalories(goalCalories, totalCalories);

      res.json({
        goalCalories,
        totalCalories,
        remainingCalories,
        meals
      });
    });
  });
};

module.exports = { addMeal, getSummary };