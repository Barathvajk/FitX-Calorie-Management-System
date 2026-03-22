const calculateBMR = (user) => {
  const { weight = 70, height = 170, age = 25, gender = 'male' } = user;
  return gender === 'female'
    ? 10 * weight + 6.25 * height - 5 * age - 161
    : 10 * weight + 6.25 * height - 5 * age + 5;
};

const calculateTDEE = (bmr, activityLevel = 1.55) => Math.round(bmr * activityLevel);

const calculateGoalCalories = (tdee, goal = 'maintain') => {
  if (goal === 'lose') return Math.max(1200, tdee - 500);
  if (goal === 'gain') return tdee + 300;
  return tdee;
};

const calculateRemainingCalories = (goal, consumed) => Math.max(0, goal - consumed);

const calculateCardioBurn = (met, weight, durationMin) =>
  Math.round(met * weight * (durationMin / 60));

const calculateMacroGoals = (calories) => ({
  protein: Math.round(calories * 0.30 / 4),
  carbs:   Math.round(calories * 0.40 / 4),
  fats:    Math.round(calories * 0.30 / 9),
});

module.exports = { calculateBMR, calculateTDEE, calculateGoalCalories, calculateRemainingCalories, calculateCardioBurn, calculateMacroGoals };
