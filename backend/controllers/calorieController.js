const Meal = require('../models/mealModel');
const Workout = require('../models/workoutModel');
const User = require('../models/userModel');
const db = require('../config/db');
const { calculateRemainingCalories, calculateMacroGoals, calculateCardioBurn } = require('../utils/calorieCalculator');

// ── MEALS ──────────────────────────────────────────────────────
const addMeal = async (req, res) => {
  try {
    const { meal_name, meal_type, calories, protein, carbs, fats, quantity } = req.body;
    if (!meal_name || !calories)
      return res.status(400).json({ message: 'Meal name and calories are required.' });

    await Meal.create({ user_id: req.user.id, meal_name, meal_type, calories, protein, carbs, fats, quantity });
    res.status(201).json({ message: 'Meal logged successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error logging meal.' });
  }
};

const deleteMeal = async (req, res) => {
  try {
    await Meal.delete(req.params.id, req.user.id);
    res.json({ message: 'Meal removed.' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting meal.' });
  }
};

const getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const todayMeals = await Meal.getTodayMeals(req.user.id);
    const weeklyMeals = await Meal.getWeeklyMeals(req.user.id);
    const todayWorkouts = await Workout.getTodayWorkouts(req.user.id);

    // Calorie sums
    const totalCalories   = todayMeals.reduce((s, m) => s + Number(m.calories), 0);
    const totalProtein    = todayMeals.reduce((s, m) => s + Number(m.protein), 0);
    const totalCarbs      = todayMeals.reduce((s, m) => s + Number(m.carbs), 0);
    const totalFats       = todayMeals.reduce((s, m) => s + Number(m.fats), 0);
    const burnedCalories  = todayWorkouts.reduce((s, w) => s + Number(w.calories_burned), 0);

    // Water & steps for today
    const [waterRows] = await db.query(
      'SELECT glasses FROM water_log WHERE user_id=? AND log_date=CURDATE()', [req.user.id]);
    const [stepsRows] = await db.query(
      'SELECT steps FROM steps_log WHERE user_id=? AND log_date=CURDATE()', [req.user.id]);

    const goalCalories = user.calorie_goal || 2000;
    const macroGoals   = calculateMacroGoals(goalCalories);
    const netCalories  = totalCalories - burnedCalories;
    const remaining    = calculateRemainingCalories(goalCalories, netCalories);

    res.json({
      user: { id: user.id, name: user.name, calorie_goal: goalCalories, goal: user.goal, weight: user.weight },
      summary: { totalCalories, burnedCalories, netCalories, remaining, goalCalories },
      macros: { protein: totalProtein, carbs: totalCarbs, fats: totalFats },
      macroGoals,
      meals: todayMeals,
      workouts: todayWorkouts,
      water: waterRows[0]?.glasses || 0,
      steps: stepsRows[0]?.steps || 0,
      weeklyData: weeklyMeals
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching dashboard data.' });
  }
};

// ── FOOD DATABASE ──────────────────────────────────────────────
const searchFood = async (req, res) => {
  try {
    const q = `%${req.query.q || ''}%`;
    const [rows] = await db.query(
      'SELECT * FROM food_items WHERE name LIKE ? LIMIT 30', [q]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error searching food.' });
  }
};

const getAllFoods = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM food_items ORDER BY name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching foods.' });
  }
};

// ── WORKOUTS ───────────────────────────────────────────────────
const logWorkout = async (req, res) => {
  try {
    const { workout_name, workout_type, duration_min, calories_burned, notes, sets } = req.body;
    if (!workout_name) return res.status(400).json({ message: 'Workout name required.' });
    const result = await Workout.create({
      user_id: req.user.id, workout_name, workout_type, duration_min, calories_burned, notes
    });
    if (sets && sets.length) await Workout.logSets(result.insertId, sets);
    res.status(201).json({ message: 'Workout logged!', workout_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error logging workout.' });
  }
};

const getWorkoutHistory = async (req, res) => {
  try {
    const workouts = await Workout.getUserWorkouts(req.user.id, 20);
    res.json(workouts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching workouts.' });
  }
};

// ── CARDIO ─────────────────────────────────────────────────────
const logCardio = async (req, res) => {
  try {
    const { activity, duration_min, met } = req.body;
    const user = await User.findById(req.user.id);
    const calories_burned = calculateCardioBurn(met || 6, user.weight || 70, duration_min || 30);
    await db.query(
      'INSERT INTO cardio_sessions (user_id, activity, duration_min, calories_burned) VALUES (?,?,?,?)',
      [req.user.id, activity, duration_min, calories_burned]
    );
    res.status(201).json({ message: 'Cardio logged!', calories_burned });
  } catch (err) {
    res.status(500).json({ message: 'Error logging cardio.' });
  }
};

// ── WATER & STEPS ──────────────────────────────────────────────
const updateWater = async (req, res) => {
  try {
    const { glasses } = req.body;
    await db.query(
      `INSERT INTO water_log (user_id, glasses, log_date) VALUES (?,?,CURDATE())
       ON DUPLICATE KEY UPDATE glasses=?`,
      [req.user.id, glasses, glasses]
    );
    res.json({ message: 'Water updated.', glasses });
  } catch (err) {
    res.status(500).json({ message: 'Error updating water.' });
  }
};

const updateSteps = async (req, res) => {
  try {
    const { steps } = req.body;
    await db.query(
      `INSERT INTO steps_log (user_id, steps, log_date) VALUES (?,?,CURDATE())
       ON DUPLICATE KEY UPDATE steps=?`,
      [req.user.id, steps, steps]
    );
    res.json({ message: 'Steps updated.', steps });
  } catch (err) {
    res.status(500).json({ message: 'Error updating steps.' });
  }
};

// ── INSIGHTS ───────────────────────────────────────────────────
const getInsights = async (req, res) => {
  try {
    const [weekly] = await db.query(
      `SELECT DATE(logged_at) as day, SUM(calories) as cal, SUM(protein) as prot,
              SUM(carbs) as carbs, SUM(fats) as fats
       FROM meals WHERE user_id=? AND logged_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
       GROUP BY DATE(logged_at) ORDER BY day`,
      [req.user.id]
    );
    const [cardio] = await db.query(
      `SELECT SUM(calories_burned) as total_burned, COUNT(*) as sessions
       FROM cardio_sessions WHERE user_id=? AND logged_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
      [req.user.id]
    );
    const [workoutStats] = await db.query(
      `SELECT COUNT(*) as total_workouts, SUM(calories_burned) as burned, SUM(duration_min) as total_min
       FROM workouts WHERE user_id=? AND logged_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
      [req.user.id]
    );
    res.json({ dailyCalories: weekly, cardio: cardio[0], workouts: workoutStats[0] });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching insights.' });
  }
};

module.exports = {
  addMeal, deleteMeal, getDashboard, searchFood, getAllFoods,
  logWorkout, getWorkoutHistory, logCardio, updateWater, updateSteps, getInsights
};
