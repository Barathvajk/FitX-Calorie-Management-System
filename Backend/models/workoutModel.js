const db = require('../config/db');

const Workout = {
  create: async (data) => {
    const [result] = await db.query(
      `INSERT INTO workouts (user_id, workout_name, workout_type, duration_min, calories_burned, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [data.user_id, data.workout_name, data.workout_type || 'Strength',
       data.duration_min || 30, data.calories_burned || 0, data.notes || '']
    );
    return result;
  },

  logSets: async (workoutId, sets) => {
    for (const s of sets) {
      await db.query(
        `INSERT INTO exercise_sets (workout_id, exercise_name, sets_done, reps, weight_kg) VALUES (?,?,?,?,?)`,
        [workoutId, s.exercise_name, s.sets_done || 0, s.reps || '', s.weight_kg || 0]
      );
    }
  },

  getUserWorkouts: async (userId, limit = 10) => {
    const [rows] = await db.query(
      `SELECT w.*, GROUP_CONCAT(es.exercise_name SEPARATOR ', ') as exercises
       FROM workouts w
       LEFT JOIN exercise_sets es ON es.workout_id = w.id
       WHERE w.user_id = ?
       GROUP BY w.id
       ORDER BY w.logged_at DESC
       LIMIT ?`,
      [userId, limit]
    );
    return rows;
  },

  getTodayWorkouts: async (userId) => {
    const [rows] = await db.query(
      `SELECT * FROM workouts WHERE user_id = ? AND DATE(logged_at) = CURDATE()`,
      [userId]
    );
    return rows;
  }
};

module.exports = Workout;
