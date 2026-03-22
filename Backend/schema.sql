CREATE DATABASE IF NOT EXISTS fitx_db;
USE fitx_db;

CREATE TABLE IF NOT EXISTS users (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(100) NOT NULL,
  email          VARCHAR(150) NOT NULL UNIQUE,
  password       VARCHAR(255) NOT NULL,
  age            INT,
  height         DECIMAL(5,2),
  weight         DECIMAL(5,2),
  gender         ENUM('male','female','other') DEFAULT 'male',
  activity_level DECIMAL(4,3) DEFAULT 1.55,
  goal           ENUM('lose','maintain','gain') DEFAULT 'maintain',
  calorie_goal   INT DEFAULT 2000,
  target_weight  DECIMAL(5,2),
  target_date    DATE,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS food_items (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  user_id   INT DEFAULT NULL,
  name      VARCHAR(100) NOT NULL,
  brand     VARCHAR(100),
  portion   VARCHAR(100),
  calories  INT NOT NULL,
  protein   DECIMAL(6,2) DEFAULT 0,
  carbs     DECIMAL(6,2) DEFAULT 0,
  fats      DECIMAL(6,2) DEFAULT 0,
  fiber     DECIMAL(6,2) DEFAULT 0,
  category  VARCHAR(50),
  barcode   VARCHAR(50),
  is_custom TINYINT(1) DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS meals (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  user_id   INT NOT NULL,
  meal_name VARCHAR(150) NOT NULL,
  meal_type ENUM('breakfast','morning_snack','lunch','afternoon_snack','dinner','post_workout') DEFAULT 'lunch',
  calories  INT DEFAULT 0,
  protein   DECIMAL(6,2) DEFAULT 0,
  carbs     DECIMAL(6,2) DEFAULT 0,
  fats      DECIMAL(6,2) DEFAULT 0,
  fiber     DECIMAL(6,2) DEFAULT 0,
  quantity  DECIMAL(5,2) DEFAULT 1,
  food_id   INT DEFAULT NULL,
  logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS favorite_foods (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  food_id    INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_fav (user_id, food_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (food_id) REFERENCES food_items(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS recent_foods (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  food_id    INT NOT NULL,
  used_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_recent (user_id, food_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (food_id) REFERENCES food_items(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workouts (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT NOT NULL,
  workout_name    VARCHAR(150) NOT NULL,
  workout_type    VARCHAR(50),
  duration_min    INT DEFAULT 0,
  calories_burned INT DEFAULT 0,
  notes           TEXT,
  logged_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS exercise_sets (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  workout_id    INT NOT NULL,
  exercise_name VARCHAR(100),
  sets_done     INT DEFAULT 0,
  reps          VARCHAR(20),
  weight_kg     DECIMAL(6,2) DEFAULT 0,
  FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cardio_sessions (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT NOT NULL,
  activity        VARCHAR(100),
  duration_min    INT DEFAULT 0,
  calories_burned INT DEFAULT 0,
  distance_km     DECIMAL(6,2),
  logged_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS water_log (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  user_id  INT NOT NULL,
  glasses  INT DEFAULT 0,
  log_date DATE NOT NULL,
  UNIQUE KEY unique_water (user_id, log_date),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS steps_log (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  user_id  INT NOT NULL,
  steps    INT DEFAULT 0,
  log_date DATE NOT NULL,
  UNIQUE KEY unique_steps (user_id, log_date),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS weight_history (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  user_id   INT NOT NULL,
  weight_kg DECIMAL(5,2) NOT NULL,
  logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS body_measurements (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  user_id   INT NOT NULL,
  chest     DECIMAL(5,2),
  waist     DECIMAL(5,2),
  hips      DECIMAL(5,2),
  arms      DECIMAL(5,2),
  thighs    DECIMAL(5,2),
  neck      DECIMAL(5,2),
  body_fat  DECIMAL(5,2),
  logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS meal_plans (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS meal_plan_items (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  plan_id      INT NOT NULL,
  day_of_week  TINYINT NOT NULL,
  meal_type    ENUM('breakfast','morning_snack','lunch','afternoon_snack','dinner','post_workout'),
  food_id      INT,
  food_name    VARCHAR(150),
  calories     INT DEFAULT 0,
  protein      DECIMAL(6,2) DEFAULT 0,
  carbs        DECIMAL(6,2) DEFAULT 0,
  fats         DECIMAL(6,2) DEFAULT 0,
  quantity     DECIMAL(5,2) DEFAULT 1,
  FOREIGN KEY (plan_id) REFERENCES meal_plans(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS friends (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  friend_id  INT NOT NULL,
  status     ENUM('pending','accepted','blocked') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_friend (user_id, friend_id),
  FOREIGN KEY (user_id)   REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  type       VARCHAR(50),
  message    TEXT,
  is_read    TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- SEED 50 food items (Indian + Western)
INSERT IGNORE INTO food_items (name, portion, calories, protein, carbs, fats, fiber, category) VALUES
('Brown Rice','1 cup cooked',216,5,45,2,3.5,'Grains'),
('White Rice','1 cup cooked',200,4,44,0,0.6,'Grains'),
('Oats','1/2 cup dry',150,5,27,3,4,'Grains'),
('Roti / Chapati','1 medium',104,3,20,2,2.7,'Grains'),
('Whole Wheat Bread','2 slices',140,6,26,2,3,'Grains'),
('Pasta','100g dry',371,13,74,2,2.5,'Grains'),
('Idli','2 pieces',140,4,28,1,1,'Grains'),
('Dosa','1 medium',168,4,32,3,1.5,'Grains'),
('Poha','1 cup cooked',180,3,36,2,2,'Grains'),
('Quinoa','1 cup cooked',222,8,39,4,5,'Grains'),
('Chicken Breast','100g grilled',165,31,0,4,0,'Protein'),
('Egg','1 large',78,6,1,5,0,'Protein'),
('Egg White','1 large',17,4,0,0,0,'Protein'),
('Salmon','100g',208,20,0,13,0,'Protein'),
('Tuna Canned','100g drained',116,26,0,1,0,'Protein'),
('Paneer','100g',265,18,4,20,0,'Dairy'),
('Greek Yogurt','1 cup',130,17,9,0,0,'Dairy'),
('Milk','1 cup 240ml',150,8,12,8,0,'Dairy'),
('Cottage Cheese','100g',98,11,3,4,0,'Dairy'),
('Curd / Dahi','1 cup',150,8,11,8,0,'Dairy'),
('Whey Protein','1 scoop 30g',120,24,3,2,0,'Supplements'),
('Dal Lentils','1 cup cooked',230,18,40,1,16,'Legumes'),
('Chickpeas','1 cup cooked',270,15,45,4,12,'Legumes'),
('Rajma Kidney Beans','1 cup cooked',225,15,40,1,13,'Legumes'),
('Moong Dal','1 cup cooked',212,14,38,1,15,'Legumes'),
('Banana','1 medium',105,1,27,0,3,'Fruits'),
('Apple','1 medium',95,0,25,0,4,'Fruits'),
('Orange','1 medium',62,1,15,0,3,'Fruits'),
('Mango','1 cup sliced',99,1,25,1,3,'Fruits'),
('Watermelon','1 cup',46,1,12,0,1,'Fruits'),
('Sweet Potato','1 medium',130,3,30,0,4,'Vegetables'),
('Broccoli','1 cup chopped',55,4,11,1,5,'Vegetables'),
('Spinach','1 cup raw',7,1,1,0,1,'Vegetables'),
('Tomato','1 medium',22,1,5,0,1.5,'Vegetables'),
('Carrot','1 medium',25,1,6,0,2,'Vegetables'),
('Almonds','28g 20 nuts',164,6,6,14,3.5,'Nuts'),
('Peanut Butter','2 tbsp',190,8,7,16,2,'Nuts'),
('Walnuts','28g',185,4,4,18,2,'Nuts'),
('Avocado','1/2 medium',120,2,6,11,5,'Healthy Fat'),
('Olive Oil','1 tbsp',119,0,0,14,0,'Healthy Fat'),
('Coconut Oil','1 tbsp',121,0,0,14,0,'Healthy Fat'),
('Sweet Corn','1 cup',132,5,29,2,4,'Vegetables'),
('Mushroom','1 cup',15,2,2,0,1,'Vegetables'),
('Palak Paneer','1 cup serving',340,18,12,24,3,'Indian Dishes'),
('Dal Makhani','1 cup serving',295,12,38,10,8,'Indian Dishes'),
('Chicken Curry','1 cup serving',280,22,8,18,2,'Indian Dishes'),
('Sambar','1 cup',80,4,14,1,4,'Indian Dishes'),
('Upma','1 cup serving',200,5,35,5,3,'Indian Dishes'),
('Chole Chana Masala','1 cup serving',270,13,42,6,10,'Indian Dishes'),
('Masala Omelette','2 eggs',180,13,4,12,1,'Protein');

SELECT 'FITX Database ready!' AS status;