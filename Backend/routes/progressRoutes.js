const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { logWeight, getWeightHistory, logMeasurements, getMeasurements, updateSteps } = require('../controllers/progressController');

router.post('/weight', auth, logWeight);
router.get('/weight', auth, getWeightHistory);
router.post('/measurements', auth, logMeasurements);
router.get('/measurements', auth, getMeasurements);
router.post('/steps', auth, updateSteps);

module.exports = router;
