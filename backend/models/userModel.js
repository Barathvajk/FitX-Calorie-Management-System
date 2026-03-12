const db = require('../config/db');
const bcrypt = require('bcrypt');
const { calculateBMR, calculateTDEE, calculateGoalCalories } = require('../utils/calorieCalculator');

const User = {
  create: async (userData) => {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const bmr = calculateBMR({
      weight: userData.weight || 70,
      height: userData.height || 170,
      age: userData.age || 25,
      gender: userData.gender || 'male'
    });
    const tdee = calculateTDEE(bmr, userData.activity_level || 1.55);
    const calorieGoal = calculateGoalCalories(tdee, userData.goal || 'maintain');

    const [result] = await db.query(
      `INSERT INTO users (name, email, password, age, height, weight, gender, activity_level, goal, calorie_goal)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userData.name, userData.email, hashedPassword,
       userData.age || null, userData.height || null, userData.weight || null,
       userData.gender || 'male', userData.activity_level || 1.55,
       userData.goal || 'maintain', calorieGoal]
    );
    return result;
  },

  findByEmail: async (email) => {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows;
  },

  findById: async (id) => {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  },

  update: async (id, data) => {
    const fields = [];
    const values = [];
    const allowed = ['name','age','height','weight','gender','activity_level','goal','calorie_goal'];
    allowed.forEach(f => {
      if (data[f] !== undefined) { fields.push(`${f}=?`); values.push(data[f]); }
    });
    if (!fields.length) return;
    values.push(id);
    await db.query(`UPDATE users SET ${fields.join(',')} WHERE id=?`, values);
  }
};

module.exports = User;
