const db = require('../config/db');

// ── WEIGHT HISTORY ──
const logWeight = async (req, res) => {
  try {
    const { weight_kg } = req.body;
    if (!weight_kg) return res.status(400).json({ message: 'Weight is required.' });
    await db.query('INSERT INTO weight_history (user_id, weight_kg) VALUES (?,?)', [req.user.id, weight_kg]);
    await db.query('UPDATE users SET weight=? WHERE id=?', [weight_kg, req.user.id]);
    res.status(201).json({ message: 'Weight logged!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error logging weight.' });
  }
};

const getWeightHistory = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT weight_kg, logged_at FROM weight_history WHERE user_id=? ORDER BY logged_at ASC LIMIT 60',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching weight history.' });
  }
};

// ── BODY MEASUREMENTS ──
const logMeasurements = async (req, res) => {
  try {
    const { chest, waist, hips, arms, thighs, neck, body_fat } = req.body;
    await db.query(
      'INSERT INTO body_measurements (user_id, chest, waist, hips, arms, thighs, neck, body_fat) VALUES (?,?,?,?,?,?,?,?)',
      [req.user.id, chest||null, waist||null, hips||null, arms||null, thighs||null, neck||null, body_fat||null]
    );
    res.status(201).json({ message: 'Measurements logged!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error logging measurements.' });
  }
};

const getMeasurements = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM body_measurements WHERE user_id=? ORDER BY logged_at DESC LIMIT 20',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching measurements.' });
  }
};

// ── STEPS ──
const updateSteps = async (req, res) => {
  try {
    const { steps } = req.body;
    await db.query(
      'INSERT INTO steps_log (user_id, steps, log_date) VALUES (?,?,CURDATE()) ON DUPLICATE KEY UPDATE steps=?',
      [req.user.id, steps, steps]
    );
    res.json({ message: 'Steps updated.', steps });
  } catch (err) {
    res.status(500).json({ message: 'Error updating steps.' });
  }
};

module.exports = { logWeight, getWeightHistory, logMeasurements, getMeasurements, updateSteps };
