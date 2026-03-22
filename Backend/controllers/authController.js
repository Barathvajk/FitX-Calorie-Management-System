const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const register = (req, res) => {
  const { name, email, password, age, height, weight, activity_level } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  // Check if user already exists
  User.findByEmail(email, (err, results) => {
    if (err) return res.status(500).json({ message: err });
    if (results.length > 0) return res.status(400).json({ message: 'Email already exists' });

    // Create user
    User.create({ name, email, password, age, height, weight, activity_level }, (err, result) => {
      if (err) return res.status(500).json({ message: err });
      return res.status(201).json({ message: 'User registered successfully' });
    });
  });
};

const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

  User.findByEmail(email, (err, results) => {
    if (err) return res.status(500).json({ message: err });
    if (results.length === 0) return res.status(400).json({ message: 'User not found' });

    const user = results[0];

    // Compare password
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

    // Create JWT
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  });
};

module.exports = { register, login };