const db = require('../config/db');

const Meal = {
  create: async (data) => {
    const [result] = await db.query(
      `INSERT INTO meals (user_id, meal_name, meal_type, calories, protein, carbs, fats, quantity)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.user_id, data.meal_name, data.meal_type || 'Lunch',
       data.calories, data.protein || 0, data.carbs || 0, data.fats || 0, data.quantity || 1]
    );
    return result;
  },

  getTodayMeals: async (userId) => {
    const [rows] = await db.query(
      `SELECT * FROM meals WHERE user_id = ? AND DATE(logged_at) = CURDATE() ORDER BY logged_at DESC`,
      [userId]
    );
    return rows;
  },

  getWeeklyMeals: async (userId) => {
    const [rows] = await db.query(
      `SELECT DATE(logged_at) as day,
              SUM(calories) as total_calories,
              SUM(protein) as total_protein,
              SUM(carbs) as total_carbs,
              SUM(fats) as total_fats
       FROM meals
       WHERE user_id = ? AND logged_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       GROUP BY DATE(logged_at)
       ORDER BY day ASC`,
      [userId]
    );
    return rows;
  },

  delete: async (id, userId) => {
    await db.query('DELETE FROM meals WHERE id = ? AND user_id = ?', [id, userId]);
  }
};

module.exports = Meal;
