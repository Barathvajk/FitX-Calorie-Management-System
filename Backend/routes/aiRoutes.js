const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { chat } = require('../controllers/aiController');
router.post('/ai/chat', auth, chat);
module.exports = router;
