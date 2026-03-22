const db = require('../config/db');

const searchUsers = async (req, res) => {
  try {
    const q = `%${req.query.q || ''}%`;
    const [rows] = await db.query(
      'SELECT id, name, email, goal FROM users WHERE (name LIKE ? OR email LIKE ?) AND id != ? LIMIT 10',
      [q, q, req.user.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ message: 'Error searching users.' }); }
};

const sendFriendRequest = async (req, res) => {
  try {
    const { friend_id } = req.body;
    if (friend_id == req.user.id) return res.status(400).json({ message: 'Cannot add yourself.' });

    // Check if request already exists in either direction
    const [existing] = await db.query(
      `SELECT id, status FROM friends 
       WHERE (user_id=? AND friend_id=?) OR (user_id=? AND friend_id=?)`,
      [req.user.id, friend_id, friend_id, req.user.id]
    );
    if (existing.length > 0) {
      if (existing[0].status === 'accepted') return res.json({ message: 'Already friends!' });
      return res.json({ message: 'Request already sent.' });
    }

    // sender = user_id, receiver = friend_id
    await db.query(
      'INSERT INTO friends (user_id, friend_id, status) VALUES (?,?,?)',
      [req.user.id, friend_id, 'pending']
    );
    res.json({ message: 'Friend request sent!' });
  } catch (err) {
    console.error('sendFriendRequest:', err.message);
    res.status(500).json({ message: 'Error sending request.' });
  }
};

const respondFriendRequest = async (req, res) => {
  try {
    const { friend_id, action } = req.body;
    // friend_id = the one who SENT the request (user_id in friends table)
    // req.user.id = the one who RECEIVED it (friend_id in friends table)
    if (action === 'accept') {
      // Update the original request to accepted
      await db.query(
        'UPDATE friends SET status=? WHERE user_id=? AND friend_id=?',
        ['accepted', friend_id, req.user.id]
      );
      // Add reverse so both see each other as friends
      await db.query(
        'INSERT IGNORE INTO friends (user_id, friend_id, status) VALUES (?,?,?)',
        [req.user.id, friend_id, 'accepted']
      );
      res.json({ message: 'Friend added!' });
    } else {
      // Delete the request
      await db.query(
        'DELETE FROM friends WHERE user_id=? AND friend_id=?',
        [friend_id, req.user.id]
      );
      res.json({ message: 'Request declined.' });
    }
  } catch (err) {
    console.error('respondFriendRequest:', err.message);
    res.status(500).json({ message: 'Error responding to request.' });
  }
};

const getFriends = async (req, res) => {
  try {
    // My accepted friends
    const [friends] = await db.query(
      `SELECT u.id, u.name, u.email, u.goal
       FROM friends f 
       JOIN users u ON u.id = f.friend_id
       WHERE f.user_id=? AND f.status='accepted'`,
      [req.user.id]
    );

    // Pending requests SENT TO ME (I am friend_id, sender is user_id)
    const [pending] = await db.query(
      `SELECT u.id, u.name, u.email
       FROM friends f 
       JOIN users u ON u.id = f.user_id
       WHERE f.friend_id=? AND f.status='pending'`,
      [req.user.id]
    );

    // Requests I SENT (pending, waiting for others to accept)
    const [sent] = await db.query(
      `SELECT u.id, u.name, u.email
       FROM friends f 
       JOIN users u ON u.id = f.friend_id
       WHERE f.user_id=? AND f.status='pending'`,
      [req.user.id]
    );

    res.json({ friends, pending, sent });
  } catch (err) {
    console.error('getFriends:', err.message);
    res.status(500).json({ message: 'Error fetching friends.' });
  }
};

const getLeaderboard = async (req, res) => {
  try {
    const [friendRows] = await db.query(
      `SELECT friend_id as id FROM friends WHERE user_id=? AND status='accepted'
       UNION
       SELECT user_id as id FROM friends WHERE friend_id=? AND status='accepted'`,
      [req.user.id, req.user.id]
    );
    const ids = [req.user.id, ...friendRows.map(f => f.id)];
    const placeholders = ids.map(() => '?').join(',');

    const [steps] = await db.query(
      `SELECT u.name, COALESCE(s.steps, 0) as steps
       FROM users u 
       LEFT JOIN steps_log s ON s.user_id=u.id AND s.log_date=CURDATE()
       WHERE u.id IN (${placeholders}) 
       ORDER BY steps DESC`, ids
    );
    const [calories] = await db.query(
      `SELECT u.name, COALESCE(SUM(c.calories_burned), 0) as burned
       FROM users u 
       LEFT JOIN cardio_sessions c ON c.user_id=u.id AND DATE(c.logged_at)=CURDATE()
       WHERE u.id IN (${placeholders}) 
       GROUP BY u.id, u.name
       ORDER BY burned DESC`, ids
    );
    res.json({ steps, calories });
  } catch (err) {
    console.error('getLeaderboard:', err.message);
    res.status(500).json({ message: 'Error fetching leaderboard.' });
  }
};

module.exports = { searchUsers, sendFriendRequest, respondFriendRequest, getFriends, getLeaderboard };
