-- ============================================================
-- FITX DATABASE SCHEMA
-- Run this file in MySQL before starting the backend
-- mysql -u root -p < schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS fitx_db;
USE fitx_db;

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(100)  NOT NULL,
  email        VARCHAR(150)  NOT NULL UNIQUE,
  password     VARCHAR(255)  NOT NULL,
  age          INT,
  height       FLOAT,           -- cm
  weight       FLOAT,           -- kg
  gender       ENUM('male','female','other') DEFAULT 'male',
  activity_level FLOAT DEFAULT 1.55,  -- 1.2 sedentary ... 1.9 athlete
  goal         ENUM('lose','maintain','gain') DEFAULT 'maintain',
  calorie_goal INT DEFAULT 2000,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- MEALS TABLE
CREATE TABLE IF NOT EXISTS meals (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  meal_name  VARCHAR(200) NOT NULL,
  meal_type  ENUM('Breakfast','Lunch','Dinner','Snacks','Pre-Workout','Post-Workout') DEFAULT 'Lunch',
  calories   FLOAT NOT NULL DEFAULT 0,
  protein    FLOAT DEFAULT 0,
  carbs      FLOAT DEFAULT 0,
  fats       FLOAT DEFAULT 0,
  quantity   FLOAT DEFAULT 1,
  logged_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- WORKOUTS TABLE
CREATE TABLE IF NOT EXISTS workouts (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  workout_name VARCHAR(200) NOT NULL,
  workout_type VARCHAR(100),
  duration_min INT DEFAULT 30,
  calories_burned FLOAT DEFAULT 0,
  notes        TEXT,
  logged_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- EXERCISE SETS TABLE (for Hevy-style tracking)
CREATE TABLE IF NOT EXISTS exercise_sets (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  workout_id  INT NOT NULL,
  exercise_name VARCHAR(200) NOT NULL,
  sets_done   INT DEFAULT 0,
  reps        VARCHAR(50),
  weight_kg   FLOAT DEFAULT 0,
  FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE
);

-- CARDIO SESSIONS TABLE
CREATE TABLE IF NOT EXISTS cardio_sessions (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  activity     VARCHAR(100) NOT NULL,
  duration_min INT NOT NULL,
  calories_burned FLOAT NOT NULL,
  logged_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- WATER LOG TABLE
CREATE TABLE IF NOT EXISTS water_log (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  user_id   INT NOT NULL,
  glasses   INT DEFAULT 0,
  log_date  DATE DEFAULT (CURDATE()),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_date (user_id, log_date)
);

-- STEPS LOG TABLE
CREATE TABLE IF NOT EXISTS steps_log (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  user_id   INT NOT NULL,
  steps     INT DEFAULT 0,
  log_date  DATE DEFAULT (CURDATE()),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_date (user_id, log_date)
);

-- FOOD DATABASE (built-in items)
CREATE TABLE IF NOT EXISTS food_items (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  name     VARCHAR(200) NOT NULL,
  portion  VARCHAR(100),
  calories FLOAT,
  protein  FLOAT,
  carbs    FLOAT,
  fats     FLOAT,
  category VARCHAR(100)
);

-- Seed food data
INSERT IGNORE INTO food_items (name, portion, calories, protein, carbs, fats, category) VALUES
('Chicken Breast', '100g', 165, 31, 0, 3.6, 'Protein'),
('Brown Rice', '100g cooked', 216, 5, 45, 1.8, 'Grains'),
('Whole Egg', '1 large', 78, 6, 0.6, 5, 'Protein'),
('Banana', '1 medium', 105, 1.3, 27, 0.4, 'Fruit'),
('Rolled Oats', '100g dry', 389, 17, 66, 7, 'Grains'),
('Salmon Fillet', '100g', 208, 20, 0, 13, 'Protein'),
('Avocado', '100g', 160, 2, 9, 15, 'Healthy Fat'),
('Greek Yogurt', '150g', 89, 15, 5.4, 0.6, 'Dairy'),
('Sweet Potato', '100g', 86, 1.6, 20, 0.1, 'Veggies'),
('Almonds', '30g', 174, 6, 6, 15, 'Nuts'),
('Broccoli', '100g', 34, 2.8, 7, 0.4, 'Veggies'),
('Paneer', '100g', 265, 18, 3.4, 20, 'Dairy'),
('Dal (Lentils)', '100g cooked', 116, 9, 20, 0.4, 'Legumes'),
('Chapati/Roti', '1 piece', 120, 3.1, 18, 3.7, 'Grains'),
('Whey Protein', '30g scoop', 120, 24, 3, 2, 'Supplement'),
('Peanut Butter', '2 tbsp', 188, 8, 6, 16, 'Nuts'),
('Spinach', '100g', 23, 2.9, 3.6, 0.4, 'Veggies'),
('White Rice', '100g cooked', 130, 2.7, 28, 0.3, 'Grains'),
('Apple', '1 medium', 95, 0.5, 25, 0.3, 'Fruit'),
('Tuna (canned)', '100g', 116, 26, 0, 1, 'Protein'),
('Idli', '2 pieces', 140, 4.4, 28, 0.6, 'Grains'),
('Protein Bar', '1 bar', 220, 20, 24, 7, 'Supplement'),
('Curd/Dahi', '100g', 61, 3.5, 4.7, 3.3, 'Dairy'),
('Mango', '100g', 60, 0.8, 15, 0.4, 'Fruit'),
('Masoor Dal', '100g cooked', 100, 8, 18, 0.4, 'Legumes'),
('Pasta', '100g dry', 371, 13, 74, 1.5, 'Grains'),
('Olive Oil', '1 tbsp', 119, 0, 0, 13.5, 'Healthy Fat'),
('Cottage Cheese', '100g', 98, 11, 3.4, 4.3, 'Dairy');

SELECT 'FITX Database setup complete!' AS status;
