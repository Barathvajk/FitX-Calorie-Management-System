const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { searchUsers, sendFriendRequest, respondFriendRequest, getFriends, getLeaderboard } = require('../controllers/socialController');
const { getNotifications, markNotificationsRead } = require('../controllers/notificationController');

router.get('/users/search', auth, searchUsers);
router.post('/friends/request', auth, sendFriendRequest);
router.post('/friends/respond', auth, respondFriendRequest);
router.get('/friends', auth, getFriends);
router.get('/leaderboard', auth, getLeaderboard);
router.get('/notifications', auth, getNotifications);
router.post('/notifications/read', auth, markNotificationsRead);

module.exports = router;
