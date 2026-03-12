# FITX — Full Stack Fitness & Calorie Management System

> Inspired by HealthifyMe · MyFitnessPal · Hevy · Cult.fit  
> Theme: ⬛ Black · ⬜ White · 🟢 Green  
> Author: Barath

---

## 🚀 Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | HTML5 · CSS3 · Vanilla JavaScript   |
| Backend  | Node.js · Express.js · JWT Auth     |
| Database | **MySQL** (recommended — see below) |
| Auth     | JWT + bcrypt                        |

### ✅ Why MySQL over MongoDB?
- Fitness data is **highly relational** (users → meals → workouts → sets → cardio)
- Strong **ACID compliance** for calorie calculations
- Better **JOIN queries** for weekly/monthly analytics
- **Familiar SQL** for structured food/nutrition data

---

## 📁 Project Structure

```
FITX/
├── frontend/
│   ├── index.html        ← Main SPA (Dashboard, Nutrition, Train, Tools, Plans, Insights, Profile, About)
│   ├── login.html        ← Login page
│   ├── register.html     ← Registration page
│   └── style.css         ← Full white/black/green theme
│
└── backend/
    ├── app.js            ← Express server entry point
    ├── schema.sql        ← MySQL database setup (run this first!)
    ├── .env              ← Environment variables
    ├── package.json
    ├── config/
    │   └── db.js         ← MySQL connection pool
    ├── controllers/
    │   ├── authController.js
    │   └── calorieController.js
    ├── middleware/
    │   └── authMiddleware.js   ← JWT verification
    ├── models/
    │   ├── userModel.js
    │   ├── mealModel.js
    │   └── workoutModel.js
    ├── routes/
    │   ├── authRoutes.js
    │   └── calorieRoutes.js
    └── utils/
        └── calorieCalculator.js   ← BMR, TDEE, macros, MET
```

---

## ⚙️ Setup Instructions

### Step 1 — MySQL Database

```sql
-- In MySQL Workbench or terminal:
mysql -u root -p < backend/schema.sql
```

This creates the `fitx_db` database with all tables and seeds 28 food items automatically.

### Step 2 — Backend

```bash
cd backend
npm install
```

Edit `.env` with your MySQL credentials:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=fitx_db
JWT_SECRET=fitx_super_secret_jwt_key_2024
JWT_EXPIRES_IN=7d
```

Start the server:
```bash
npm run dev      # development (nodemon)
npm start        # production
```

Server runs at: **http://localhost:5000**

### Step 3 — Frontend

Open `frontend/index.html` in your browser, or serve via backend (already configured):

```
http://localhost:5000
```

> The backend serves frontend files automatically via Express static middleware.

---

## 🌟 Features

### 🏠 Dashboard
- Calorie ring with SVG animation
- Net calories, burned, remaining
- Macro bars (Protein · Carbs · Fat)
- Weekly bar chart (7-day overview)
- Steps tracker with progress bar
- Water intake (8-glass tracker)
- Workout count for the day
- Meal slot summary cards (6 slots)

### 🥗 Nutrition (3 sub-views)
- **Log Food** — 28-item database, search, portion qty adjuster, live macro preview
- **Food Diary** — Full day view by meal slot, delete entries
- **Cardio** — 10 activities, MET-based burn calculation, session log

### 🏋️ Train (Hevy-style)
- 6 workout plans (Push/Pull/Legs/HIIT/Core/Yoga)
- Live workout mode with stopwatch
- Set-by-set tap-to-complete tracking
- Workout history log

### 🔧 Health Tools
- BMI Calculator with category & advice
- Body Fat % Calculator
- TDEE Calculator (BMR + activity)
- Macro Split Calculator

### 📋 Meal Plans (Cult.fit style)
- 3 expert meal plans (High Protein Cut, Vegetarian Build, Balanced Maintain)
- Workout history grid

### 📊 Insights
- 30-day calorie trend chart
- Cardio session stats
- Weekly workout stats
- 7-day streak tracker

### 👤 Profile
- Edit name, weight, height, age, goal, activity
- Auto BMR/TDEE recalculation on save
- One-tap calorie goal presets (Cut/Bulk/Maintain)
- Achievements system

---

## 🗄️ Database Schema

```
users         — id, name, email, password, age, height, weight, gender, activity_level, goal, calorie_goal
meals         — id, user_id, meal_name, meal_type, calories, protein, carbs, fats, quantity, logged_at
workouts      — id, user_id, workout_name, workout_type, duration_min, calories_burned, logged_at
exercise_sets — id, workout_id, exercise_name, sets_done, reps, weight_kg
cardio_sessions — id, user_id, activity, duration_min, calories_burned, logged_at
water_log     — id, user_id, glasses, log_date
steps_log     — id, user_id, steps, log_date
food_items    — id, name, portion, calories, protein, carbs, fats, category (28 items seeded)
```

---

## 🔐 API Endpoints

### Auth
```
POST /api/register     — Create account
POST /api/login        — Login, returns JWT
GET  /api/profile      — Get profile (auth required)
PUT  /api/profile      — Update profile (auth required)
```

### Nutrition & Fitness
```
GET  /api/dashboard    — Full dashboard data
POST /api/meals        — Log a meal
DELETE /api/meals/:id  — Remove a meal
GET  /api/foods        — All food items
GET  /api/foods/search?q= — Search foods
POST /api/workouts     — Log a workout
GET  /api/workouts     — Workout history
POST /api/cardio       — Log cardio session
POST /api/water        — Update water glasses
POST /api/steps        — Update steps count
GET  /api/insights     — 30-day analytics
```

---

## 📞 Contact

FITX123@gmail.com | +123-456-7890
