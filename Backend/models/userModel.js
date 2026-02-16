const db = require('../config/db');
const bcrypt = require('bcrypt');

const User = {
  create: (userData, callback) => {
    const hashedPassword = bcrypt.hashSync(userData.password, 10);
    db.query(
      'INSERT INTO users (name, email, password, age, height, weight, activity_level) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userData.name, userData.email, hashedPassword, userData.age, userData.height, userData.weight, userData.activity_level],
      callback
    );
  },
  findByEmail: (email, callback) => {
    db.query('SELECT * FROM users WHERE email = ?', [email], callback);
  }
};

module.exports = User;