# 🏋️ FITX  — Fitness & Calorie Tracking App

> Full-stack fitness app. Node.js + Express + MySQL backend. HTML/CSS/JS frontend.

## ✅ All Features

### Core
- 🔐 JWT Authentication (Register / Login)
- 🏠 Dashboard — Calorie ring, macros, weekly chart, meal slots
- 🥗 Nutrition — Log meals, food diary, delete meals
- 🏋️ Workout logging — 6 plans, live timer, set tracking
- 🏃 Cardio — 10 activities, MET-based calorie calculation
- 💧 Water tracker (8 glasses)
- 👣 Steps tracker

### New Features
- ✏️ Custom Food Entry — add any food with full macros
- ⭐ Favorite Foods — save & quick-access frequently eaten foods
- 🕐 Recent Foods — auto-tracked last 10 foods logged
- 📷 Barcode Scanner — Open Food Facts API integration
- 🎯 Weight Goal Tracking — set target + deadline, progress bar on dashboard
- 📅 30-day Logging Streak tracking
- 📥 Export diary as CSV
- 👥 Friends & Social + Leaderboard
- 🤖 AI Diet Coach (Claude API)
- 📊 30-day Insights & Analytics
- 📈 Progress — weight history chart, body measurements
- 🔧 Tools — BMI, Body Fat%, TDEE, Macro Calculator
- 🔔 Notifications system
- 🌙 Dark mode

## 🚀 Setup & Run

### 1. Database
```bash
mysql -u root -p < backend/schema.sql
```

### 2. Environment
Edit `backend/.env`:
```
DB_PASSWORD=your_mysql_password_here
ANTHROPIC_API_KEY=your_key_here   # Optional - for AI Coach
```

### 3. Install & Start
```bash
cd backend
npm install
npm run dev
```

### 4. Open
Visit: http://localhost:5000

## 📁 Structure
```
FITX/
├── frontend/          # HTML/CSS/JS (served by Express)
│   ├── index.html     # Main SPA — all pages
│   ├── login.html
│   ├── register.html
│   └── style.css
└── backend/
    ├── app.js
    ├── schema.sql     # Run this first!
    ├── .env           # Set your passwords here
    ├── controllers/   # Business logic
    ├── models/        # DB queries
    ├── routes/        # API endpoints
    └── utils/         # Calculator functions
```

## 🌐 Deploy to Production

### Option 1: Railway (easiest)
1. Push to GitHub
2. Connect Railway to your repo
3. Add environment variables in Railway dashboard
4. Deploy!

### Option 2: VPS (DigitalOcean / AWS)
```bash
# Install Node.js + MySQL on server
npm install -g pm2
pm2 start backend/app.js --name fitx
pm2 save && pm2 startup
```

### Option 3: Render.com
- Connect GitHub repo
- Set build command: `cd backend && npm install`
- Set start command: `cd backend && node app.js`
- Add environment variables

## 🔑 API Endpoints
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/register | Register user |
| POST | /api/login | Login |
| GET | /api/dashboard | Home page data |
| POST | /api/meals | Log a meal |
| DELETE | /api/meals/:id | Delete meal |
| GET | /api/foods | All foods |
| POST | /api/foods/custom | Add custom food |
| GET | /api/foods/favorites | Saved favorites |
| POST | /api/foods/favorite | Toggle favorite |
| GET | /api/foods/recent | Recent foods |
| GET | /api/foods/barcode/:code | Barcode lookup |
| POST | /api/workouts | Log workout |
| GET | /api/workouts | Workout history |
| POST | /api/cardio | Log cardio |
| POST | /api/water | Update water |
| POST | /api/steps | Update steps |
| POST | /api/weight | Log weight |
| GET | /api/weight | Weight history |
| POST | /api/measurements | Log measurements |
| POST | /api/goal | Set weight goal |
| GET | /api/insights | 30-day analytics |
| GET | /api/export | Export CSV |
| POST | /api/ai/chat | AI Coach |
| GET/PUT | /api/profile | User profile |
