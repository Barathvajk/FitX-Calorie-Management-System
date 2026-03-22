const Meal = require('../models/mealModel');
const Workout = require('../models/workoutModel');
const User = require('../models/userModel');
const db = require('../config/db');
const { calculateRemainingCalories, calculateMacroGoals, calculateCardioBurn } = require('../utils/calorieCalculator');

// ── MEALS ──
const addMeal = async (req, res) => {
  try {
    const { meal_name, meal_type, calories, protein, carbs, fats, fiber, quantity, food_id } = req.body;
    if (!meal_name) return res.status(400).json({ message: 'Meal name is required.' });
    const validTypes = ['breakfast','morning_snack','lunch','afternoon_snack','dinner','post_workout'];
    const mealType = validTypes.includes(meal_type) ? meal_type : 'lunch';
    await Meal.create({ user_id: req.user.id, meal_name, meal_type: mealType,
      calories: Number(calories)||0, protein: Number(protein)||0, carbs: Number(carbs)||0,
      fats: Number(fats)||0, fiber: Number(fiber)||0, quantity: Number(quantity)||1, food_id: food_id||null });
    // Track recent foods — silently ignore FK errors
    if (food_id) {
      try {
        await db.query(`INSERT INTO recent_foods (user_id,food_id) VALUES (?,?) ON DUPLICATE KEY UPDATE used_at=NOW()`, [req.user.id, food_id]);
      } catch(e) {
        console.log('recent_foods skip:', e.message);
      }
    }
    res.status(201).json({ message: 'Meal logged!' });
  } catch (err) {
    console.error('addMeal:', err.message);
    res.status(500).json({ message: 'Error logging meal: ' + err.message });
  }
};

const deleteMeal = async (req, res) => {
  try {
    await Meal.delete(req.params.id, req.user.id);
    res.json({ message: 'Meal removed.' });
  } catch (err) { res.status(500).json({ message: 'Error deleting meal.' }); }
};

const getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    const todayMeals = await Meal.getTodayMeals(req.user.id);
    const weeklyMeals = await Meal.getWeeklyMeals(req.user.id);
    const todayWorkouts = await Workout.getTodayWorkouts(req.user.id);
    const totalCalories = todayMeals.reduce((s,m)=>s+Number(m.calories||0),0);
    const totalProtein  = todayMeals.reduce((s,m)=>s+Number(m.protein||0),0);
    const totalCarbs    = todayMeals.reduce((s,m)=>s+Number(m.carbs||0),0);
    const totalFats     = todayMeals.reduce((s,m)=>s+Number(m.fats||0),0);
    const workoutCal    = todayWorkouts.reduce((s,w)=>s+Number(w.calories_burned||0),0);
    const [cardioRows]  = await db.query(`SELECT COALESCE(SUM(calories_burned),0) as total FROM cardio_sessions WHERE user_id=? AND DATE(logged_at)=CURDATE()`,[req.user.id]);
    const burntCalories = workoutCal + Number(cardioRows[0]?.total||0);
    const [waterRows]   = await db.query('SELECT glasses FROM water_log WHERE user_id=? AND log_date=CURDATE()',[req.user.id]);
    const [stepsRows]   = await db.query('SELECT steps FROM steps_log WHERE user_id=? AND log_date=CURDATE()',[req.user.id]);
    const goalCalories  = user.calorie_goal || 2000;
    const netCalories   = totalCalories - burntCalories;
    const remaining     = Math.max(0, goalCalories - netCalories);
    // Goal progress
    let goalProgress = null;
    if (user.target_weight && user.weight && user.target_date) {
      const startWeight = user.weight;
      const current = user.weight;
      const target = user.target_weight;
      const daysLeft = Math.ceil((new Date(user.target_date) - new Date()) / 86400000);
      const totalChange = Math.abs(target - startWeight) || 1;
      const achieved = Math.abs(current - startWeight);
      goalProgress = { targetWeight: target, daysLeft: Math.max(0,daysLeft), percent: Math.min(100,Math.round(achieved/totalChange*100)) };
    }
    const weeklyChart = [];
    for (let i=6;i>=0;i--) {
      const d=new Date();d.setDate(d.getDate()-i);
      const day=weeklyMeals.find(w=>new Date(w.day).toDateString()===d.toDateString());
      weeklyChart.push({calories:Number(day?.cal||0),burned:0});
    }
    res.json({
      userName:user.name, userGoal:user.goal, calorieGoal:goalCalories, tdee:goalCalories,
      todayCalories:totalCalories, todayProtein:Math.round(totalProtein), todayCarbs:Math.round(totalCarbs),
      todayFats:Math.round(totalFats), cardioCalories:burntCalories, netCalories, remaining,
      todayWater:Number(waterRows[0]?.glasses||0), todaySteps:Number(stepsRows[0]?.steps||0),
      todayWorkouts:todayWorkouts.length, todayMeals, weeklyData:weeklyChart, goalProgress,
      userWeight:user.weight, userHeight:user.height
    });
  } catch (err) {
    console.error('getDashboard:', err.message);
    res.status(500).json({ message: 'Dashboard error: '+err.message });
  }
};

// ── FOOD ──
const getAllFoods = async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM food_items WHERE user_id IS NULL OR user_id=? ORDER BY category,name`,[req.user.id]);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: 'Error fetching foods.' }); }
};

const searchFood = async (req, res) => {
  try {
    const q = `%${req.query.q||''}%`;
    const [rows] = await db.query(`SELECT * FROM food_items WHERE (user_id IS NULL OR user_id=?) AND (name LIKE ? OR brand LIKE ?) LIMIT 30`,[req.user.id,q,q]);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: 'Error searching.' }); }
};

const addCustomFood = async (req, res) => {
  try {
    const { name, brand, portion, calories, protein, carbs, fats, fiber, category } = req.body;
    if (!name || !calories) return res.status(400).json({ message: 'Name and calories required.' });
    const [result] = await db.query(
      `INSERT INTO food_items (user_id,name,brand,portion,calories,protein,carbs,fats,fiber,category,is_custom) VALUES (?,?,?,?,?,?,?,?,?,?,1)`,
      [req.user.id,name,brand||null,portion||'1 serving',Number(calories),Number(protein)||0,Number(carbs)||0,Number(fats)||0,Number(fiber)||0,category||'Custom']
    );
    res.status(201).json({ message: 'Custom food added!', id: result.insertId });
  } catch (err) {
    console.error('addCustomFood:', err.message);
    res.status(500).json({ message: 'Error adding food.' });
  }
};

const getCustomFoods = async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM food_items WHERE user_id=? AND is_custom=1 ORDER BY name`,[req.user.id]);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: 'Error fetching custom foods.' }); }
};

const deleteCustomFood = async (req, res) => {
  try {
    await db.query(`DELETE FROM food_items WHERE id=? AND user_id=?`,[req.params.id, req.user.id]);
    res.json({ message: 'Food deleted.' });
  } catch (err) { res.status(500).json({ message: 'Error deleting food.' }); }
};

const getFavoriteFoods = async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT f.* FROM food_items f JOIN favorite_foods ff ON ff.food_id=f.id WHERE ff.user_id=? ORDER BY f.name`,[req.user.id]);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: 'Error fetching favorites.' }); }
};

const toggleFavorite = async (req, res) => {
  try {
    const { food_id } = req.body;
    const [existing] = await db.query(`SELECT id FROM favorite_foods WHERE user_id=? AND food_id=?`,[req.user.id, food_id]);
    if (existing.length) {
      await db.query(`DELETE FROM favorite_foods WHERE user_id=? AND food_id=?`,[req.user.id, food_id]);
      res.json({ message: 'Removed from favorites', favorited: false });
    } else {
      await db.query(`INSERT INTO favorite_foods (user_id,food_id) VALUES (?,?)`,[req.user.id, food_id]);
      res.json({ message: 'Added to favorites!', favorited: true });
    }
  } catch (err) { res.status(500).json({ message: 'Error toggling favorite.' }); }
};

const getRecentFoods = async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT f.* FROM food_items f JOIN recent_foods rf ON rf.food_id=f.id WHERE rf.user_id=? ORDER BY rf.used_at DESC LIMIT 10`,[req.user.id]);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: 'Error fetching recent.' }); }
};

const lookupBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;
    // Check local DB first
    const [local] = await db.query(`SELECT * FROM food_items WHERE barcode=? LIMIT 1`,[barcode]);
    if (local.length) return res.json({ found: true, food: local[0], source: 'local' });
    // Fetch from Open Food Facts API
    const https = require('https');
    const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
    https.get(url, (apiRes) => {
      let data = '';
      apiRes.on('data', chunk => data += chunk);
      apiRes.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.status === 1 && parsed.product) {
            const p = parsed.product;
            const n = p.nutriments || {};
            const food = {
              name: p.product_name || p.abbreviated_product_name || 'Unknown',
              brand: p.brands || '',
              portion: `100g`,
              calories: Math.round(n['energy-kcal_100g'] || n['energy_100g']/4.184 || 0),
              protein: Math.round((n.proteins_100g||0)*10)/10,
              carbs: Math.round((n.carbohydrates_100g||0)*10)/10,
              fats: Math.round((n.fat_100g||0)*10)/10,
              fiber: Math.round((n.fiber_100g||0)*10)/10,
              barcode, source: 'openfoodfacts'
            };
            res.json({ found: true, food });
          } else {
            res.json({ found: false });
          }
        } catch { res.json({ found: false }); }
      });
    }).on('error', () => res.json({ found: false }));
  } catch (err) { res.status(500).json({ message: 'Barcode lookup error.' }); }
};

// ── WORKOUTS ──
const logWorkout = async (req, res) => {
  try {
    const { workout_name, workout_type, duration_min, calories_burned, notes, sets } = req.body;
    if (!workout_name) return res.status(400).json({ message: 'Workout name required.' });
    const result = await Workout.create({
      user_id: req.user.id, workout_name,
      workout_type: workout_type || 'strength',
      duration_min: Number(duration_min) || 1,
      calories_burned: Number(calories_burned) || 0,
      notes: notes || ''
    });
    if (sets && Array.isArray(sets) && sets.length) await Workout.logSets(result.insertId, sets);
    res.status(201).json({ message: 'Workout logged!', workout_id: result.insertId });
  } catch (err) {
    console.error('logWorkout:', err.message);
    res.status(500).json({ message: 'Error logging workout: '+err.message });
  }
};

const getWorkoutHistory = async (req, res) => {
  try {
    const workouts = await Workout.getUserWorkouts(req.user.id, 20);
    const [cardioSessions] = await db.query(`SELECT * FROM cardio_sessions WHERE user_id=? ORDER BY logged_at DESC LIMIT 10`,[req.user.id]);
    res.json({ workouts, cardioSessions });
  } catch (err) {
    console.error('getWorkoutHistory:', err.message);
    res.status(500).json({ message: 'Error fetching workouts.' });
  }
};

// ── CARDIO ──
const logCardio = async (req, res) => {
  try {
    const { activity, duration_min, calories_burned, met, distance_km } = req.body;
    if (!activity || !duration_min) return res.status(400).json({ message: 'Activity and duration required.' });
    let burned = Number(calories_burned) || 0;
    if (!burned) { const user = await User.findById(req.user.id); burned = calculateCardioBurn(met||6, user.weight||70, duration_min); }
    await db.query(`INSERT INTO cardio_sessions (user_id,activity,duration_min,calories_burned,distance_km) VALUES (?,?,?,?,?)`,
      [req.user.id, activity, Number(duration_min), burned, distance_km||null]);
    res.status(201).json({ message: 'Cardio logged!', calories_burned: burned });
  } catch (err) {
    console.error('logCardio:', err.message);
    res.status(500).json({ message: 'Error logging cardio.' });
  }
};

// ── WATER ──
const updateWater = async (req, res) => {
  try {
    const { glasses } = req.body;
    await db.query(`INSERT INTO water_log (user_id,glasses,log_date) VALUES (?,?,CURDATE()) ON DUPLICATE KEY UPDATE glasses=?`,
      [req.user.id, Number(glasses), Number(glasses)]);
    res.json({ message: 'Water updated.', glasses });
  } catch (err) { res.status(500).json({ message: 'Error updating water.' }); }
};

// ── INSIGHTS ──
const getInsights = async (req, res) => {
  try {
    const [daily] = await db.query(`SELECT DATE(logged_at) as day, SUM(calories) as cal FROM meals WHERE user_id=? AND logged_at>=DATE_SUB(CURDATE(),INTERVAL 30 DAY) GROUP BY DATE(logged_at) ORDER BY day`,[req.user.id]);
    const [cardio] = await db.query(`SELECT SUM(calories_burned) as total, COUNT(*) as sessions, AVG(calories_burned) as avg_cal FROM cardio_sessions WHERE user_id=? AND logged_at>=DATE_SUB(NOW(),INTERVAL 30 DAY)`,[req.user.id]);
    const [wktStats] = await db.query(`SELECT COUNT(*) as total, SUM(calories_burned) as burned, SUM(duration_min) as total_min FROM workouts WHERE user_id=? AND logged_at>=DATE_SUB(NOW(),INTERVAL 30 DAY)`,[req.user.id]);
    const [mealStats] = await db.query(`SELECT SUM(calories) as total, AVG(calories) as avg, SUM(protein) as prot, SUM(carbs) as carbs, SUM(fats) as fats FROM meals WHERE user_id=? AND logged_at>=DATE_SUB(NOW(),INTERVAL 30 DAY)`,[req.user.id]);
    const [streak] = await db.query(`SELECT COUNT(DISTINCT DATE(logged_at)) as days FROM meals WHERE user_id=? AND logged_at>=DATE_SUB(CURDATE(),INTERVAL 7 DAY)`,[req.user.id]);
    const calorieTrend = [];
    for (let i=29;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const row=daily.find(r=>new Date(r.day).toDateString()===d.toDateString());calorieTrend.push(Number(row?.cal||0));}
    res.json({
      calorieTrend, totalCalories:Number(mealStats[0]?.total||0), avgCalories:Math.round(Number(mealStats[0]?.avg||0)),
      totalCardio:Number(cardio[0]?.sessions||0), totalCardioCal:Number(cardio[0]?.total||0), avgCardio:Math.round(Number(cardio[0]?.avg_cal||0)),
      totalWorkouts:Number(wktStats[0]?.total||0), totalWktMin:Number(wktStats[0]?.total_min||0), totalWktCal:Number(wktStats[0]?.burned||0),
      streak:Number(streak[0]?.days||0), totalProtein:Number(mealStats[0]?.prot||0), totalCarbs:Number(mealStats[0]?.carbs||0), totalFats:Number(mealStats[0]?.fats||0)
    });
  } catch (err) {
    console.error('getInsights:', err.message);
    res.status(500).json({ message: 'Error fetching insights.' });
  }
};

// ── GOAL PROGRESS ──
const setGoal = async (req, res) => {
  try {
    const { target_weight, target_date } = req.body;
    await db.query(`UPDATE users SET target_weight=?, target_date=? WHERE id=?`,[target_weight, target_date, req.user.id]);
    res.json({ message: 'Goal updated!' });
  } catch (err) { res.status(500).json({ message: 'Error setting goal.' }); }
};

// ── EXPORT ──
const exportDiary = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const start = start_date || new Date(Date.now()-30*86400000).toISOString().split('T')[0];
    const end = end_date || new Date().toISOString().split('T')[0];
    const [meals] = await db.query(`SELECT meal_name,meal_type,calories,protein,carbs,fats,quantity,DATE(logged_at) as date FROM meals WHERE user_id=? AND DATE(logged_at) BETWEEN ? AND ? ORDER BY logged_at`,[req.user.id,start,end]);
    const [workouts] = await db.query(`SELECT workout_name,workout_type,duration_min,calories_burned,DATE(logged_at) as date FROM workouts WHERE user_id=? AND DATE(logged_at) BETWEEN ? AND ? ORDER BY logged_at`,[req.user.id,start,end]);
    // Build CSV
    let csv = 'Date,Type,Name,Calories,Protein,Carbs,Fats\n';
    meals.forEach(m => { csv += `${m.date},Meal - ${m.meal_type},${m.meal_name},${m.calories},${m.protein},${m.carbs},${m.fats}\n`; });
    workouts.forEach(w => { csv += `${w.date},Workout,${w.workout_name},${w.calories_burned},0,0,0\n`; });
    res.setHeader('Content-Type','text/csv');
    res.setHeader('Content-Disposition',`attachment; filename=fitx-diary-${start}-to-${end}.csv`);
    res.send(csv);
  } catch (err) { res.status(500).json({ message: 'Error exporting.' }); }
};

module.exports = {
  addMeal, deleteMeal, getDashboard, getAllFoods, searchFood,
  addCustomFood, getCustomFoods, deleteCustomFood,
  getFavoriteFoods, toggleFavorite, getRecentFoods, lookupBarcode,
  logWorkout, getWorkoutHistory, logCardio, updateWater, getInsights,
  setGoal, exportDiary
};
