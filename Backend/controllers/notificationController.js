const db = require('../config/db');

const getNotifications = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 20',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching notifications.' });
  }
};

const markNotificationsRead = async (req, res) => {
  try {
    await db.query('UPDATE notifications SET is_read=1 WHERE user_id=?', [req.user.id]);
    res.json({ message: 'Marked as read.' });
  } catch (err) {
    res.status(500).json({ message: 'Error.' });
  }
};

module.exports = { getNotifications, markNotificationsRead };
