const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const c = require('../controllers/calorieController');

router.get('/dashboard', auth, c.getDashboard);
router.post('/meals', auth, c.addMeal);
router.delete('/meals/:id', auth, c.deleteMeal);
router.get('/foods', auth, c.getAllFoods);
router.get('/foods/search', auth, c.searchFood);
router.post('/foods/custom', auth, c.addCustomFood);
router.get('/foods/custom', auth, c.getCustomFoods);
router.delete('/foods/custom/:id', auth, c.deleteCustomFood);
router.get('/foods/favorites', auth, c.getFavoriteFoods);
router.post('/foods/favorite', auth, c.toggleFavorite);
router.get('/foods/recent', auth, c.getRecentFoods);
router.get('/foods/barcode/:barcode', auth, c.lookupBarcode);
router.post('/workouts', auth, c.logWorkout);
router.get('/workouts', auth, c.getWorkoutHistory);
router.post('/cardio', auth, c.logCardio);
router.post('/water', auth, c.updateWater);
router.get('/insights', auth, c.getInsights);
router.post('/goal', auth, c.setGoal);
router.get('/export', auth, c.exportDiary);

module.exports = router;
