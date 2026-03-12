// Mifflin-St Jeor BMR formula
function calculateBMR({ weight, height, age, gender }) {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

// TDEE = BMR × activity multiplier
function calculateTDEE(bmr, activityLevel) {
  return Math.round(bmr * (activityLevel || 1.55));
}

// Goal-based calorie target
function calculateGoalCalories(tdee, goal) {
  if (goal === 'lose')     return tdee - 500;
  if (goal === 'gain')     return tdee + 300;
  return tdee; // maintain
}

// Remaining calories
function calculateRemainingCalories(goalCalories, consumedCalories) {
  return goalCalories - consumedCalories;
}

// MET-based cardio burn: Calories = MET × weight(kg) × time(hours)
function calculateCardioBurn(met, weightKg, durationMin) {
  return Math.round(met * weightKg * (durationMin / 60));
}

// BMI
function calculateBMI(weight, heightCm) {
  const h = heightCm / 100;
  return parseFloat((weight / (h * h)).toFixed(1));
}

function getBMICategory(bmi) {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25)   return 'Normal weight';
  if (bmi < 30)   return 'Overweight';
  return 'Obese';
}

// Macro goals (standard splits)
function calculateMacroGoals(calories) {
  return {
    protein: Math.round((calories * 0.30) / 4),  // 30% from protein
    carbs:   Math.round((calories * 0.45) / 4),  // 45% from carbs
    fats:    Math.round((calories * 0.25) / 9),  // 25% from fat
  };
}

module.exports = {
  calculateBMR,
  calculateTDEE,
  calculateGoalCalories,
  calculateRemainingCalories,
  calculateCardioBurn,
  calculateBMI,
  getBMICategory,
  calculateMacroGoals
};
