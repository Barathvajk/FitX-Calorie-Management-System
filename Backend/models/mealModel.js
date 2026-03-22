const db = require('../config/db');

const Meal = {
  create: (mealData, callback) => {
    db.query(
      'INSERT INTO meals (user_id, meal_name, calories, protein, carbs, fats, date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [mealData.user_id, mealData.meal_name, mealData.calories, mealData.protein || 0, mealData.carbs || 0, mealData.fats || 0, new Date()],
      callback
    );
  },
  getTodayMeals: (userId, callback) => {
    db.query(
      'SELECT * FROM meals WHERE user_id = ? AND DATE(date) = CURDATE()',
      [userId],
      callback
    );
  }
};

module.exports = Meal;