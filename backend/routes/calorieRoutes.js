const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  addMeal, deleteMeal, getDashboard, searchFood, getAllFoods,
  logWorkout, getWorkoutHistory, logCardio, updateWater, updateSteps, getInsights
} = require('../controllers/calorieController');

// Dashboard
router.get('/dashboard', auth, getDashboard);

// Meals
router.post('/meals', auth, addMeal);
router.delete('/meals/:id', auth, deleteMeal);

// Food DB
router.get('/foods', auth, getAllFoods);
router.get('/foods/search', auth, searchFood);

// Workouts
router.post('/workouts', auth, logWorkout);
router.get('/workouts', auth, getWorkoutHistory);

// Cardio
router.post('/cardio', auth, logCardio);

// Water & Steps
router.post('/water', auth, updateWater);
router.post('/steps', auth, updateSteps);

// Insights
router.get('/insights', auth, getInsights);

module.exports = router;
