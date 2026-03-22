const db = require('../config/db');
const bcrypt = require('bcrypt');

const User = {
  create: async (data) => {
    const hash = await bcrypt.hash(data.password, 10);
    const [result] = await db.query(
      `INSERT INTO users (name, email, password, age, height, weight, gender, activity_level, goal)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.name, data.email, hash, data.age||null, data.height||null, data.weight||null,
       data.gender||'male', data.activity_level||1.55, data.goal||'maintain']
    );
    return result;
  },

  findByEmail: async (email) => {
    const [rows] = await db.query('SELECT * FROM users WHERE email=? LIMIT 1', [email]);
    return rows;
  },

  findById: async (id) => {
    const [rows] = await db.query('SELECT * FROM users WHERE id=? LIMIT 1', [id]);
    return rows[0] || null;
  },

  update: async (id, data) => {
    const allowed = ['name','age','height','weight','gender','activity_level','goal','calorie_goal','target_weight','target_date'];
    const fields = Object.keys(data).filter(k => allowed.includes(k) && data[k] !== undefined && data[k] !== '');
    if (!fields.length) return;
    const sets = fields.map(f => `${f}=?`).join(', ');
    const vals = fields.map(f => data[f]);
    await db.query(`UPDATE users SET ${sets} WHERE id=?`, [...vals, id]);
  }
};

module.exports = User;
