const express = require('express');
const router = express.Router();
const calorieController = require('../controllers/calorieController');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/meals', authenticateToken, calorieController.addMeal);
router.get('/summary', authenticateToken, calorieController.getSummary);

module.exports = router;