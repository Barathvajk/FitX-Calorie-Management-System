const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const register = async (req, res) => {
  try {
    const { name, email, password, age, height, weight, gender, activity_level, goal } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required.' });

    const existing = await User.findByEmail(email);
    if (existing.length > 0)
      return res.status(400).json({ message: 'Email already registered.' });

    await User.create({ name, email, password, age, height, weight, gender, activity_level, goal });
    res.status(201).json({ message: 'Account created successfully! Please login.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required.' });

    const results = await User.findByEmail(email);
    if (results.length === 0)
      return res.status(400).json({ message: 'No account found with this email.' });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Incorrect password.' });

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET || 'fitx_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id, name: user.name, email: user.email,
        age: user.age, height: user.height, weight: user.weight,
        gender: user.gender, goal: user.goal,
        calorie_goal: user.calorie_goal, activity_level: user.activity_level
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { calculateBMR, calculateTDEE, calculateGoalCalories } = require('../utils/calorieCalculator');
    const updates = req.body;
    // Recalculate calorie goal if body metrics changed
    if (updates.weight || updates.height || updates.age || updates.activity_level || updates.goal) {
      const user = await User.findById(req.user.id);
      const merged = { ...user, ...updates };
      const bmr = calculateBMR(merged);
      const tdee = calculateTDEE(bmr, merged.activity_level);
      updates.calorie_goal = calculateGoalCalories(tdee, merged.goal);
    }
    await User.update(req.user.id, updates);
    // Return updated user
    const updated = await User.findById(req.user.id);
    const { password: _, ...safeUser } = updated;
    res.json({ message: 'Profile updated successfully.', user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating profile.' });
  }
};

module.exports = { register, login, getProfile, updateProfile };
