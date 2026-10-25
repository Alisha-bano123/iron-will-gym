const express    = require('express');
const router     = express.Router();
const User       = require('../models/User');
const Attendance = require('../models/Attendance');
const Feedback   = require('../models/Feedback');
const { protect, approvedClientOnly } = require('../middleware/authMiddleware');

router.use(protect, approvedClientOnly);

// ════════════════════════════════════════════════════════════════════════════
// DIET PLANS — gender + goal + fitnessLevel + age + weight ke hisaab se
// ════════════════════════════════════════════════════════════════════════════
const getDietPlan = (gender, goal, fitnessLevel, age, weight) => {

  // Calorie calculation (Harris-Benedict formula simplified)
  let bmr = gender === 'male'
    ? 88.36 + (13.4 * weight) + (4.8 * 177) - (5.7 * age)
    : 447.6 + (9.2  * weight) + (3.1 * 163) - (4.3 * age);

  const activityFactor = { beginner: 1.375, average: 1.55, expert: 1.725 };
  let tdee = Math.round(bmr * (activityFactor[fitnessLevel] || 1.55));
  let targetCal = goal === 'weight_gain' ? tdee + 400 : tdee - 500;
  targetCal = Math.max(1200, targetCal);

  const plans = {
    // ── MALE WEIGHT GAIN ──────────────────────────────────────────────────
    male_weight_gain_beginner: {
      calories: `${targetCal} kcal/day`,
      proteinTarget: `${Math.round(weight * 1.6)}g protein/day`,
      meals: [
        { time: '7:00 AM',  name: 'Breakfast',        emoji: '🌅', items: ['3 whole eggs scrambled', '2 brown bread slices', '1 banana', '1 glass full-fat milk'], cal: Math.round(targetCal * 0.22) },
        { time: '10:00 AM', name: 'Mid-Morning Snack', emoji: '🥜', items: ['A handful of mixed nuts (almonds, walnuts)', '1 apple', '1 glass milk or lassi'], cal: Math.round(targetCal * 0.12) },
        { time: '1:00 PM',  name: 'Lunch',             emoji: '🍱', items: ['2 cups rice', '150g dal (protein-rich)', '1 bowl sabzi', '2 chapati', '1 cup curd'], cal: Math.round(targetCal * 0.28) },
        { time: '4:00 PM',  name: 'Pre-Workout',       emoji: '⚡', items: ['2 boiled eggs', '1 banana', '1 cup oats with milk + honey'], cal: Math.round(targetCal * 0.15) },
        { time: '7:30 PM',  name: 'Post-Workout',      emoji: '💪', items: ['3 boiled eggs / paneer 100g', '1 cup sweet potato or brown rice', '1 glass milk'], cal: Math.round(targetCal * 0.13) },
        { time: '9:30 PM',  name: 'Dinner',            emoji: '🌙', items: ['2 chapati', '150g chicken / 200g paneer', '1 bowl sabzi', 'salad'], cal: Math.round(targetCal * 0.10) },
      ],
      tips: ['Eat every 3 hours — don\'t let yourself go hungry', 'Focus on protein in every meal', 'Drink 3L water daily', 'Sleep 8 hours — muscles grow during sleep', 'Don\'t rush — as a beginner, consistency matters more than perfection']
    },
    male_weight_gain_average: {
      calories: `${targetCal} kcal/day`,
      proteinTarget: `${Math.round(weight * 1.8)}g protein/day`,
      meals: [
        { time: '6:30 AM',  name: 'Early Morning',     emoji: '🌄', items: ['5 soaked almonds', '2 walnuts', '1 glass warm water with honey'], cal: Math.round(targetCal * 0.05) },
        { time: '8:00 AM',  name: 'Breakfast',         emoji: '🌅', items: ['4 whole eggs', '2 brown bread / paratha', '1 banana', '1 glass milk'], cal: Math.round(targetCal * 0.22) },
        { time: '11:00 AM', name: 'Mid-Morning',       emoji: '🥜', items: ['Protein shake (whey if available)', '1 fruit', '10 almonds'], cal: Math.round(targetCal * 0.13) },
        { time: '1:30 PM',  name: 'Lunch',             emoji: '🍱', items: ['2.5 cups rice', '200g chicken breast / paneer', '1 cup dal', 'sabzi', '2 chapati', 'curd'], cal: Math.round(targetCal * 0.27) },
        { time: '4:30 PM',  name: 'Pre-Workout',       emoji: '⚡', items: ['1 banana', '1 cup oats', 'black coffee', '2 egg whites'], cal: Math.round(targetCal * 0.12) },
        { time: '7:30 PM',  name: 'Post-Workout',      emoji: '💪', items: ['Protein shake + 4 boiled eggs', '1 cup sweet potato', '1 glass milk'], cal: Math.round(targetCal * 0.13) },
        { time: '9:30 PM',  name: 'Dinner',            emoji: '🌙', items: ['200g fish / chicken', '2 chapati', 'salad', 'sabzi'], cal: Math.round(targetCal * 0.08) },
      ],
      tips: ['Increase weights progressively each week', 'Track your calories for first 2 weeks', 'Prioritize compound lifts', 'Don\'t skip any meal', 'Protein is king — hit your protein target daily']
    },
    male_weight_gain_expert: {
      calories: `${targetCal} kcal/day`,
      proteinTarget: `${Math.round(weight * 2.0)}g protein/day`,
      meals: [
        { time: '5:30 AM',  name: 'Pre-Workout (Early)', emoji: '🌄', items: ['2 whole eggs', '1 banana', 'black coffee', '5g creatine'], cal: Math.round(targetCal * 0.08) },
        { time: '8:00 AM',  name: 'Post-Workout Breakfast', emoji: '🌅', items: ['Whey protein shake', '5 whole eggs', '3 brown bread', '1 glass milk', 'oats'], cal: Math.round(targetCal * 0.25) },
        { time: '11:00 AM', name: 'Mid-Morning',        emoji: '🥜', items: ['200g chicken / paneer', '1 cup rice', '1 fruit', 'nuts'], cal: Math.round(targetCal * 0.18) },
        { time: '2:00 PM',  name: 'Lunch',              emoji: '🍱', items: ['3 cups rice', '250g chicken breast', '2 cups dal', '2 chapati', 'sabzi', 'curd'], cal: Math.round(targetCal * 0.25) },
        { time: '5:00 PM',  name: 'Evening Snack',      emoji: '⚡', items: ['Mass gainer / protein shake', '2 bananas', '1 cup oats'], cal: Math.round(targetCal * 0.12) },
        { time: '8:00 PM',  name: 'Dinner',             emoji: '🌙', items: ['300g fish / chicken / red meat', '3 chapati', 'sabzi', 'salad', 'curd'], cal: Math.round(targetCal * 0.12) },
      ],
      tips: ['Periodize your nutrition — bulk/cut cycles', 'Use creatine 5g/day for strength gains', 'Carb timing is critical — more around workouts', 'Consider intermittent fasting on rest days', 'Monitor body composition every 2 weeks']
    },

    // ── MALE WEIGHT LOSS ─────────────────────────────────────────────────
    male_weight_loss_beginner: {
      calories: `${targetCal} kcal/day`,
      proteinTarget: `${Math.round(weight * 1.6)}g protein/day`,
      meals: [
        { time: '7:00 AM',  name: 'Morning Start',     emoji: '🌅', items: ['Warm lemon water', '2 egg whites + 1 whole egg', '1 brown bread', 'green tea'], cal: Math.round(targetCal * 0.18) },
        { time: '10:00 AM', name: 'Mid-Morning',        emoji: '🍎', items: ['1 apple or pear', '8-10 almonds', '1 glass buttermilk'], cal: Math.round(targetCal * 0.10) },
        { time: '1:00 PM',  name: 'Lunch',              emoji: '🥗', items: ['Big salad first', '1 cup brown rice', '150g grilled chicken / 150g paneer', '1 cup dal'], cal: Math.round(targetCal * 0.32) },
        { time: '4:00 PM',  name: 'Pre-Workout',        emoji: '⚡', items: ['1 small banana', 'black coffee or green tea'], cal: Math.round(targetCal * 0.08) },
        { time: '7:00 PM',  name: 'Post-Workout',       emoji: '💪', items: ['3 boiled eggs / 100g paneer', '1 cup mixed vegetables'], cal: Math.round(targetCal * 0.18) },
        { time: '9:00 PM',  name: 'Dinner',             emoji: '🌙', items: ['1 chapati', 'big vegetable soup', '100g protein', 'large salad'], cal: Math.round(targetCal * 0.14) },
      ],
      tips: ['Start slow — don\'t crash diet', 'Walk 30 min daily even on rest days', 'Drink 3L water — it reduces hunger', 'Avoid sugar, maida, fried food', 'Sleep 8 hours — poor sleep increases fat storage']
    },
    male_weight_loss_average: {
      calories: `${targetCal} kcal/day`,
      proteinTarget: `${Math.round(weight * 1.8)}g protein/day`,
      meals: [
        { time: '6:30 AM',  name: 'Morning Ritual',    emoji: '🌄', items: ['Warm lemon water + 1 tsp apple cider vinegar', 'green tea'], cal: Math.round(targetCal * 0.03) },
        { time: '8:00 AM',  name: 'Breakfast',         emoji: '🌅', items: ['3 egg whites + 1 yolk omelette', '1 brown bread', '1 cup green tea', '5 almonds'], cal: Math.round(targetCal * 0.20) },
        { time: '11:00 AM', name: 'Snack',             emoji: '🍎', items: ['1 apple', '10 almonds', '1 glass cucumber water'], cal: Math.round(targetCal * 0.08) },
        { time: '1:30 PM',  name: 'Lunch',             emoji: '🥗', items: ['Salad (cucumber, tomato, lemon)', '150g grilled chicken / fish / paneer', '1 cup brown rice', '1 cup dal'], cal: Math.round(targetCal * 0.30) },
        { time: '4:30 PM',  name: 'Pre-Workout',       emoji: '⚡', items: ['Black coffee', '1 banana or protein shake (low cal)'], cal: Math.round(targetCal * 0.08) },
        { time: '7:30 PM',  name: 'Post-Workout',      emoji: '💪', items: ['4 boiled egg whites', 'steamed vegetables', '1 scoop whey (if available)'], cal: Math.round(targetCal * 0.18) },
        { time: '9:30 PM',  name: 'Dinner',            emoji: '🌙', items: ['Vegetable soup or dal soup', '1 chapati (optional)', '100g protein', 'salad'], cal: Math.round(targetCal * 0.13) },
      ],
      tips: ['Track every meal using a food diary', 'Strength training is essential — don\'t just do cardio', 'Eat protein with every meal to preserve muscle', 'Avoid alcohol completely during fat loss', 'Cheat meal allowed once a week — not cheat day']
    },
    male_weight_loss_expert: {
      calories: `${targetCal} kcal/day`,
      proteinTarget: `${Math.round(weight * 2.0)}g protein/day`,
      meals: [
        { time: '6:00 AM',  name: 'Fasted Cardio Prep', emoji: '🌄', items: ['Black coffee or green tea', 'BCAAs (if available)', '500ml water'], cal: Math.round(targetCal * 0.02) },
        { time: '8:30 AM',  name: 'Post-Cardio Breakfast', emoji: '🌅', items: ['5 egg whites + 1 yolk', 'spinach omelette', '1 brown bread', '1 scoop whey'], cal: Math.round(targetCal * 0.22) },
        { time: '12:00 PM', name: 'Lunch',               emoji: '🥗', items: ['200g chicken / fish (grilled)', '1 cup quinoa / brown rice', 'large salad with olive oil', '100g broccoli'], cal: Math.round(targetCal * 0.30) },
        { time: '3:30 PM',  name: 'Pre-Workout',         emoji: '⚡', items: ['1 banana', 'pre-workout / black coffee', '5g creatine'], cal: Math.round(targetCal * 0.08) },
        { time: '6:30 PM',  name: 'Post-Workout',        emoji: '💪', items: ['Whey protein shake', '200g sweet potato', '1 banana'], cal: Math.round(targetCal * 0.20) },
        { time: '9:00 PM',  name: 'Dinner',              emoji: '🌙', items: ['200g fish / chicken', 'steamed vegetables (300g)', '1 cup dal', 'large salad'], cal: Math.round(targetCal * 0.18) },
      ],
      tips: ['Use carb cycling — high carb on training days, low carb on rest days', 'Implement 16:8 intermittent fasting', 'Monitor body fat % every 2 weeks', 'Refeed day once a week to avoid metabolic adaptation', 'Prioritize sleep — cortisol spikes from poor sleep cause fat storage']
    },

    // ── FEMALE WEIGHT GAIN ────────────────────────────────────────────────
    female_weight_gain_beginner: {
      calories: `${targetCal} kcal/day`,
      proteinTarget: `${Math.round(weight * 1.5)}g protein/day`,
      meals: [
        { time: '7:00 AM',  name: 'Breakfast',         emoji: '🌸', items: ['2 whole eggs + 1 egg white', '1 cup oats with honey', '1 banana', '1 glass full-fat milk'], cal: Math.round(targetCal * 0.23) },
        { time: '10:00 AM', name: 'Morning Snack',     emoji: '🥛', items: ['Greek yogurt with fruits', 'a handful of mixed nuts', '1 glass lassi'], cal: Math.round(targetCal * 0.13) },
        { time: '1:00 PM',  name: 'Lunch',             emoji: '🍱', items: ['1.5 cups rice', '150g paneer / chicken', '1 cup dal', '1 bowl sabzi', '1 cup curd', '2 chapati'], cal: Math.round(targetCal * 0.28) },
        { time: '4:00 PM',  name: 'Pre-Workout',       emoji: '⚡', items: ['1 banana + peanut butter toast', 'coconut water or milk'], cal: Math.round(targetCal * 0.13) },
        { time: '7:00 PM',  name: 'Post-Workout',      emoji: '💪', items: ['2 boiled eggs / 100g paneer', '1 cup sweet potato', '1 glass milk'], cal: Math.round(targetCal * 0.12) },
        { time: '9:30 PM',  name: 'Dinner',            emoji: '🌙', items: ['2 chapati', '150g protein source', 'sabzi', 'salad', 'curd'], cal: Math.round(targetCal * 0.11) },
      ],
      tips: ['Include iron-rich foods (spinach, dates, rajma) — important for females', 'Don\'t fear carbs — you need energy to grow', 'Calcium is important: milk, paneer, curd daily', 'Eat healthy fats: avocado, nuts, ghee (small amount)', 'Periods week — eat more iron-rich foods, reduce workout intensity']
    },
    female_weight_gain_average: {
      calories: `${targetCal} kcal/day`,
      proteinTarget: `${Math.round(weight * 1.7)}g protein/day`,
      meals: [
        { time: '7:00 AM',  name: 'Breakfast',         emoji: '🌸', items: ['3 whole eggs', '2 whole wheat paratha with ghee', '1 glass milk with turmeric', '1 banana'], cal: Math.round(targetCal * 0.23) },
        { time: '10:30 AM', name: 'Mid-Morning',        emoji: '🥜', items: ['Protein shake / Greek yogurt', 'mixed dry fruits (10-12 pieces)', '1 fruit'], cal: Math.round(targetCal * 0.15) },
        { time: '1:30 PM',  name: 'Lunch',             emoji: '🍱', items: ['2 cups rice / quinoa', '200g paneer / chicken', '1 cup dal', 'sabzi with good oil', 'salad + curd'], cal: Math.round(targetCal * 0.28) },
        { time: '4:30 PM',  name: 'Pre-Workout',       emoji: '⚡', items: ['1 cup oats with milk', '1 banana', '1 boiled egg'], cal: Math.round(targetCal * 0.13) },
        { time: '7:30 PM',  name: 'Post-Workout',      emoji: '💪', items: ['Protein shake / 3 eggs', 'sweet potato or banana', '1 glass chocolate milk'], cal: Math.round(targetCal * 0.13) },
        { time: '9:30 PM',  name: 'Dinner',            emoji: '🌙', items: ['150g chicken / fish / paneer', '2 chapati', 'sabzi', 'large salad'], cal: Math.round(targetCal * 0.08) },
      ],
      tips: ['Progressive overload in gym — increase weights every week', 'Don\'t skip strength training — it won\'t make you bulky', 'Track measurements (waist, hips, arms) weekly', 'Sleep 8 hours for hormonal balance and muscle gain', 'Stay consistent — female muscle gain is slower but lasts longer']
    },
    female_weight_gain_expert: {
      calories: `${targetCal} kcal/day`,
      proteinTarget: `${Math.round(weight * 1.9)}g protein/day`,
      meals: [
        { time: '6:30 AM',  name: 'Pre-Workout',       emoji: '🌄', items: ['2 whole eggs', '1 banana', 'black coffee', 'BCAAs'], cal: Math.round(targetCal * 0.10) },
        { time: '9:00 AM',  name: 'Post-Workout Breakfast', emoji: '🌸', items: ['Whey protein shake', '4 eggs', 'oats with fruits', '1 glass milk'], cal: Math.round(targetCal * 0.25) },
        { time: '12:00 PM', name: 'Lunch',             emoji: '🍱', items: ['2.5 cups rice / quinoa', '200g chicken / fish', 'sweet potato', '1 cup dal', 'large salad'], cal: Math.round(targetCal * 0.28) },
        { time: '4:00 PM',  name: 'Snack',             emoji: '🥜', items: ['Cottage cheese / paneer 100g', 'nuts and seeds', '1 fruit', 'green tea'], cal: Math.round(targetCal * 0.12) },
        { time: '7:30 PM',  name: 'Dinner',            emoji: '🌙', items: ['200g salmon / chicken / paneer', '2 chapati or brown rice', 'roasted vegetables', 'avocado'], cal: Math.round(targetCal * 0.15) },
        { time: '10:00 PM', name: 'Before Bed',        emoji: '🌛', items: ['1 glass warm milk with turmeric', 'casein protein (if available)', '5 almonds'], cal: Math.round(targetCal * 0.10) },
      ],
      tips: ['Periodize training — 4 weeks bulk, 2 weeks maintenance', 'Creatine 3-5g/day is safe and effective for females', 'Monitor hormones — thyroid, estrogen affect fat/muscle balance', 'Competition-level nutrition requires precise macro tracking', 'Recovery weeks every 6-8 weeks prevent overtraining']
    },

    // ── FEMALE WEIGHT LOSS ────────────────────────────────────────────────
    female_weight_loss_beginner: {
      calories: `${targetCal} kcal/day`,
      proteinTarget: `${Math.round(weight * 1.4)}g protein/day`,
      meals: [
        { time: '7:00 AM',  name: 'Morning Ritual',    emoji: '🌸', items: ['Warm lemon water (empty stomach)', '2 egg whites + veggies scramble', 'green tea'], cal: Math.round(targetCal * 0.15) },
        { time: '10:00 AM', name: 'Snack',             emoji: '🍎', items: ['1 apple or papaya', '8 almonds', '1 glass buttermilk (no sugar)'], cal: Math.round(targetCal * 0.10) },
        { time: '1:00 PM',  name: 'Lunch',             emoji: '🥗', items: ['Large salad (cucumber, tomato, onion, lemon)', '1 cup brown rice', '100g paneer / chicken', '1 cup dal'], cal: Math.round(targetCal * 0.32) },
        { time: '4:00 PM',  name: 'Pre-Workout',       emoji: '⚡', items: ['1 small banana', 'green tea or black coffee'], cal: Math.round(targetCal * 0.08) },
        { time: '7:00 PM',  name: 'Post-Workout',      emoji: '💪', items: ['2 boiled egg whites', '1 cup mixed steamed vegetables', '100g low-fat paneer'], cal: Math.round(targetCal * 0.20) },
        { time: '9:00 PM',  name: 'Dinner',            emoji: '🌙', items: ['Vegetable soup (no cream)', '1 thin chapati', '100g protein', 'large salad'], cal: Math.round(targetCal * 0.15) },
      ],
      tips: ['Don\'t skip meals — it slows metabolism', '30 min walk daily is essential', 'Never go below 1200 calories', 'Hormonal balance: eat enough, don\'t starve', 'Start with simple workouts and be consistent']
    },
    female_weight_loss_average: {
      calories: `${targetCal} kcal/day`,
      proteinTarget: `${Math.round(weight * 1.6)}g protein/day`,
      meals: [
        { time: '6:30 AM',  name: 'Morning Detox',     emoji: '🌄', items: ['Warm lemon water + 1 tsp honey', 'green tea', '5 soaked almonds'], cal: Math.round(targetCal * 0.05) },
        { time: '8:30 AM',  name: 'Breakfast',         emoji: '🌸', items: ['2 egg whites + 1 yolk omelette with vegetables', '1 slice multigrain bread', 'green tea'], cal: Math.round(targetCal * 0.20) },
        { time: '11:30 AM', name: 'Snack',             emoji: '🍎', items: ['1 apple / 1 cup papaya', '10 almonds / walnuts', 'green tea'], cal: Math.round(targetCal * 0.08) },
        { time: '2:00 PM',  name: 'Lunch',             emoji: '🥗', items: ['Salad first (200g)', '100g grilled chicken / fish', '1 cup brown rice', '1 cup dal', 'lemon water'], cal: Math.round(targetCal * 0.30) },
        { time: '5:00 PM',  name: 'Pre-Workout',       emoji: '⚡', items: ['Black coffee / green tea', '1 rice cake or 1 fruit'], cal: Math.round(targetCal * 0.07) },
        { time: '8:00 PM',  name: 'Post-Workout',      emoji: '💪', items: ['Protein shake / 3 egg whites', 'steamed broccoli, beans, carrots'], cal: Math.round(targetCal * 0.18) },
        { time: '10:00 PM', name: 'Dinner',            emoji: '🌙', items: ['Veg soup or dal soup', '100g grilled protein', 'large salad'], cal: Math.round(targetCal * 0.12) },
      ],
      tips: ['Combine cardio with strength training for best results', 'HIIT burns more calories than steady cardio', 'Avoid processed food, sugar and maida completely', 'Track calories for first month to understand your eating', 'Celebrate non-scale victories: energy, mood, strength']
    },
    female_weight_loss_expert: {
      calories: `${targetCal} kcal/day`,
      proteinTarget: `${Math.round(weight * 1.8)}g protein/day`,
      meals: [
        { time: '6:00 AM',  name: 'Fasted State',      emoji: '🌄', items: ['Black coffee', 'BCAAs (if available)', '500ml water'], cal: Math.round(targetCal * 0.02) },
        { time: '9:00 AM',  name: 'Post-Workout Breakfast', emoji: '🌸', items: ['4 egg whites + 1 yolk', 'spinach and mushroom', '1 scoop whey / soy protein', 'green tea'], cal: Math.round(targetCal * 0.25) },
        { time: '1:00 PM',  name: 'Lunch',             emoji: '🥗', items: ['150g salmon / chicken / tofu', '1/2 cup quinoa', '300g salad (olive oil, lemon)', 'avocado 30g'], cal: Math.round(targetCal * 0.30) },
        { time: '4:30 PM',  name: 'Pre-Workout',       emoji: '⚡', items: ['1 small banana', 'pre-workout / black coffee', 'BCAAs'], cal: Math.round(targetCal * 0.08) },
        { time: '7:30 PM',  name: 'Post-Workout',      emoji: '💪', items: ['Protein shake', 'steamed vegetables 300g', '1 small sweet potato'], cal: Math.round(targetCal * 0.22) },
        { time: '9:30 PM',  name: 'Dinner',            emoji: '🌙', items: ['150g white fish / chicken', 'large salad', 'steamed broccoli', 'lemon water'], cal: Math.round(targetCal * 0.13) },
      ],
      tips: ['16:8 intermittent fasting is highly effective for females', 'Carb cycle: high carbs on leg day, low on rest days', 'Monitor hormonal health — thyroid, PCOS affect fat loss', 'Strength training 4x/week preserves muscle during cut', 'Refeed day once a week to reset leptin levels']
    }
  };

  const key = `${gender}_${goal}_${fitnessLevel}`;
  return plans[key] || plans[`${gender}_${goal}_beginner`];
};

// ════════════════════════════════════════════════════════════════════════════
// WORKOUT PLANS — gender + goal + fitnessLevel
// ════════════════════════════════════════════════════════════════════════════
const getWorkoutPlan = (gender, goal, fitnessLevel) => {
  const plans = {
    // ── MALE WEIGHT GAIN BEGINNER ─────────────────────────────────────────
    male_weight_gain_beginner: {
      schedule: '3 days/week', splitType: 'Full Body (Beginner)',
      days: [
        { day: 'Monday', focus: 'Full Body A', exercises: [
          { name: 'Bodyweight Squat',   sets: '3', reps: '12', rest: '60s', muscle: 'Legs',    animation: 'squat' },
          { name: 'Push-ups',           sets: '3', reps: '10', rest: '60s', muscle: 'Chest',   animation: 'pushup' },
          { name: 'Dumbbell Row',       sets: '3', reps: '10', rest: '60s', muscle: 'Back',    animation: 'row' },
          { name: 'Dumbbell Curl',      sets: '2', reps: '12', rest: '45s', muscle: 'Biceps',  animation: 'curl' },
          { name: 'Plank Hold',         sets: '3', reps: '30s', rest: '30s', muscle: 'Core',   animation: 'plank' },
        ]},
        { day: 'Tuesday', focus: 'Rest / Walk 30 min', exercises: [] },
        { day: 'Wednesday', focus: 'Full Body B', exercises: [
          { name: 'Goblet Squat (DB)',  sets: '3', reps: '10', rest: '60s', muscle: 'Legs',    animation: 'squat' },
          { name: 'Incline Push-ups',   sets: '3', reps: '12', rest: '60s', muscle: 'Chest',   animation: 'pushup' },
          { name: 'Lat Pulldown',       sets: '3', reps: '10', rest: '60s', muscle: 'Back',    animation: 'pulldown' },
          { name: 'Overhead Press DB',  sets: '3', reps: '10', rest: '60s', muscle: 'Shoulders', animation: 'press' },
          { name: 'Leg Raises',         sets: '3', reps: '12', rest: '30s', muscle: 'Core',    animation: 'legraise' },
        ]},
        { day: 'Thursday', focus: 'Rest / Walk 30 min', exercises: [] },
        { day: 'Friday', focus: 'Full Body C', exercises: [
          { name: 'Romanian Deadlift',  sets: '3', reps: '10', rest: '90s', muscle: 'Hamstrings', animation: 'deadlift' },
          { name: 'Dumbbell Bench Press', sets: '3', reps: '10', rest: '60s', muscle: 'Chest', animation: 'benchpress' },
          { name: 'Seated Row',         sets: '3', reps: '10', rest: '60s', muscle: 'Back',    animation: 'row' },
          { name: 'Lateral Raises',     sets: '2', reps: '12', rest: '45s', muscle: 'Shoulders', animation: 'lateral' },
          { name: 'Calf Raises',        sets: '3', reps: '15', rest: '30s', muscle: 'Calves',  animation: 'calf' },
        ]},
        { day: 'Saturday', focus: 'Active Recovery', exercises: [] },
        { day: 'Sunday', focus: 'Rest', exercises: [] },
      ],
      tips: ['Focus on form, not weight', 'Increase weight by 2.5kg when you can do all reps easily', 'Rest 48 hours between sessions', 'Record your weights every session']
    },

    // ── MALE WEIGHT GAIN AVERAGE ──────────────────────────────────────────
    male_weight_gain_average: {
      schedule: '5 days/week', splitType: 'Push Pull Legs (PPL)',
      days: [
        { day: 'Monday', focus: 'Push — Chest + Shoulders + Triceps', exercises: [
          { name: 'Bench Press',         sets: '4', reps: '8–10', rest: '90s', muscle: 'Chest',     animation: 'benchpress' },
          { name: 'Incline DB Press',    sets: '3', reps: '10–12', rest: '60s', muscle: 'Upper Chest', animation: 'benchpress' },
          { name: 'Shoulder Press',      sets: '4', reps: '8–10', rest: '90s', muscle: 'Shoulders', animation: 'press' },
          { name: 'Lateral Raises',      sets: '3', reps: '12–15', rest: '45s', muscle: 'Side Delt', animation: 'lateral' },
          { name: 'Tricep Pushdown',     sets: '3', reps: '12', rest: '60s', muscle: 'Triceps',    animation: 'tricep' },
          { name: 'Skull Crushers',      sets: '3', reps: '10', rest: '60s', muscle: 'Triceps',    animation: 'tricep' },
        ]},
        { day: 'Tuesday', focus: 'Pull — Back + Biceps', exercises: [
          { name: 'Deadlift',            sets: '4', reps: '6–8', rest: '2min', muscle: 'Full Back', animation: 'deadlift' },
          { name: 'Pull-ups / Lat Pulldown', sets: '4', reps: '8–10', rest: '90s', muscle: 'Lats', animation: 'pulldown' },
          { name: 'Bent Over Rows',      sets: '3', reps: '10', rest: '90s', muscle: 'Mid Back',   animation: 'row' },
          { name: 'Face Pulls',          sets: '3', reps: '15', rest: '45s', muscle: 'Rear Delt',  animation: 'facepull' },
          { name: 'Barbell Curl',        sets: '3', reps: '10–12', rest: '60s', muscle: 'Biceps',  animation: 'curl' },
          { name: 'Hammer Curls',        sets: '3', reps: '12', rest: '60s', muscle: 'Brachialis', animation: 'curl' },
        ]},
        { day: 'Wednesday', focus: 'Legs', exercises: [
          { name: 'Barbell Squat',       sets: '4', reps: '8–10', rest: '2min', muscle: 'Quads',   animation: 'squat' },
          { name: 'Romanian Deadlift',   sets: '3', reps: '10', rest: '90s', muscle: 'Hamstrings', animation: 'deadlift' },
          { name: 'Leg Press',           sets: '3', reps: '12', rest: '90s', muscle: 'Quads',      animation: 'legpress' },
          { name: 'Leg Curl',            sets: '3', reps: '12', rest: '60s', muscle: 'Hamstrings', animation: 'legcurl' },
          { name: 'Calf Raises',         sets: '4', reps: '15–20', rest: '45s', muscle: 'Calves', animation: 'calf' },
        ]},
        { day: 'Thursday', focus: 'Rest / Light Cardio', exercises: [] },
        { day: 'Friday', focus: 'Push (Volume)', exercises: [
          { name: 'Overhead Press',      sets: '4', reps: '8', rest: '90s', muscle: 'Shoulders',   animation: 'press' },
          { name: 'Cable Fly',           sets: '3', reps: '12–15', rest: '60s', muscle: 'Chest',   animation: 'fly' },
          { name: 'Dips',               sets: '3', reps: '10–12', rest: '60s', muscle: 'Triceps',  animation: 'dip' },
          { name: 'Arnold Press',        sets: '3', reps: '10', rest: '60s', muscle: 'Shoulders',  animation: 'press' },
          { name: 'Tricep Extension',    sets: '3', reps: '12', rest: '60s', muscle: 'Triceps',    animation: 'tricep' },
        ]},
        { day: 'Saturday', focus: 'Pull (Volume)', exercises: [
          { name: 'T-Bar Rows',          sets: '4', reps: '10', rest: '90s', muscle: 'Back',        animation: 'row' },
          { name: 'Single Arm DB Row',   sets: '3', reps: '10 each', rest: '60s', muscle: 'Lats',   animation: 'row' },
          { name: 'Cable Row',           sets: '3', reps: '12', rest: '60s', muscle: 'Mid Back',    animation: 'row' },
          { name: 'Preacher Curl',       sets: '3', reps: '10', rest: '60s', muscle: 'Biceps',      animation: 'curl' },
          { name: 'Reverse Fly',         sets: '3', reps: '15', rest: '45s', muscle: 'Rear Delt',   animation: 'fly' },
        ]},
        { day: 'Sunday', focus: 'Rest', exercises: [] },
      ],
      tips: ['Progressive overload every week', 'Don\'t skip legs — biggest muscle group', 'Sleep 7–9 hours', 'Track every lift in notebook']
    },

    // ── MALE WEIGHT GAIN EXPERT ───────────────────────────────────────────
    male_weight_gain_expert: {
      schedule: '6 days/week', splitType: 'PPL + Arms Specialization',
      days: [
        { day: 'Monday', focus: 'Chest + Triceps (Heavy)', exercises: [
          { name: 'Barbell Bench Press', sets: '5', reps: '5', rest: '3min', muscle: 'Chest',       animation: 'benchpress' },
          { name: 'Incline DB Press',    sets: '4', reps: '8', rest: '90s', muscle: 'Upper Chest',  animation: 'benchpress' },
          { name: 'Cable Crossover',     sets: '3', reps: '12–15', rest: '60s', muscle: 'Inner Chest', animation: 'fly' },
          { name: 'Close Grip Bench',    sets: '4', reps: '8', rest: '90s', muscle: 'Triceps',      animation: 'benchpress' },
          { name: 'Overhead Tricep Ext', sets: '3', reps: '10', rest: '60s', muscle: 'Long Head',   animation: 'tricep' },
          { name: 'Tricep Dips (weighted)', sets: '3', reps: '8–10', rest: '90s', muscle: 'Triceps', animation: 'dip' },
        ]},
        { day: 'Tuesday', focus: 'Back + Biceps (Heavy)', exercises: [
          { name: 'Deadlift',            sets: '5', reps: '4–6', rest: '3min', muscle: 'Full Back', animation: 'deadlift' },
          { name: 'Weighted Pull-ups',   sets: '4', reps: '6–8', rest: '2min', muscle: 'Lats',      animation: 'pulldown' },
          { name: 'Barbell Row',         sets: '4', reps: '8', rest: '90s', muscle: 'Mid Back',     animation: 'row' },
          { name: 'Meadows Row',         sets: '3', reps: '10', rest: '60s', muscle: 'Upper Back',  animation: 'row' },
          { name: 'Incline DB Curl',     sets: '4', reps: '8–10', rest: '60s', muscle: 'Biceps',    animation: 'curl' },
          { name: 'Drag Curl',           sets: '3', reps: '10', rest: '60s', muscle: 'Biceps Peak', animation: 'curl' },
        ]},
        { day: 'Wednesday', focus: 'Legs (Heavy)', exercises: [
          { name: 'Barbell Squat',       sets: '5', reps: '5', rest: '3min', muscle: 'Quads',       animation: 'squat' },
          { name: 'Hack Squat',          sets: '4', reps: '8', rest: '2min', muscle: 'Quads',       animation: 'legpress' },
          { name: 'Romanian Deadlift',   sets: '4', reps: '8', rest: '90s', muscle: 'Hamstrings',   animation: 'deadlift' },
          { name: 'Leg Curl',            sets: '4', reps: '10', rest: '60s', muscle: 'Hamstrings',  animation: 'legcurl' },
          { name: 'Standing Calf Raise', sets: '5', reps: '15–20', rest: '45s', muscle: 'Calves',  animation: 'calf' },
        ]},
        { day: 'Thursday', focus: 'Shoulders + Traps', exercises: [
          { name: 'Overhead Press BB',   sets: '5', reps: '5', rest: '3min', muscle: 'Front Delt',  animation: 'press' },
          { name: 'DB Lateral Raise',    sets: '5', reps: '12–15', rest: '45s', muscle: 'Side Delt', animation: 'lateral' },
          { name: 'Rear Delt Fly',       sets: '4', reps: '15', rest: '45s', muscle: 'Rear Delt',   animation: 'fly' },
          { name: 'Barbell Shrug',       sets: '4', reps: '12', rest: '60s', muscle: 'Traps',       animation: 'shrug' },
          { name: 'Face Pulls',          sets: '3', reps: '20', rest: '45s', muscle: 'Rotator Cuff', animation: 'facepull' },
        ]},
        { day: 'Friday', focus: 'Legs (Volume)', exercises: [
          { name: 'Front Squat',         sets: '4', reps: '8', rest: '2min', muscle: 'Quads',       animation: 'squat' },
          { name: 'Walking Lunges',      sets: '4', reps: '12 steps', rest: '90s', muscle: 'Glutes', animation: 'lunge' },
          { name: 'Leg Extension',       sets: '4', reps: '15', rest: '60s', muscle: 'Quads',       animation: 'legcurl' },
          { name: 'Nordic Curl',         sets: '3', reps: '6–8', rest: '90s', muscle: 'Hamstrings', animation: 'legcurl' },
          { name: 'Donkey Calf Raise',   sets: '5', reps: '20', rest: '30s', muscle: 'Calves',      animation: 'calf' },
        ]},
        { day: 'Saturday', focus: 'Arms + Core', exercises: [
          { name: 'EZ Bar Curl',         sets: '4', reps: '10', rest: '60s', muscle: 'Biceps',      animation: 'curl' },
          { name: 'Hammer Curl',         sets: '4', reps: '12', rest: '60s', muscle: 'Brachialis',  animation: 'curl' },
          { name: 'Cable Pushdown',      sets: '4', reps: '12', rest: '60s', muscle: 'Triceps',     animation: 'tricep' },
          { name: 'Overhead Ext (cable)', sets: '3', reps: '12', rest: '60s', muscle: 'Triceps',    animation: 'tricep' },
          { name: 'Hanging Leg Raise',   sets: '4', reps: '15', rest: '45s', muscle: 'Core',        animation: 'legraise' },
          { name: 'Cable Crunch',        sets: '4', reps: '15', rest: '45s', muscle: 'Abs',         animation: 'crunch' },
        ]},
        { day: 'Sunday', focus: 'Rest', exercises: [] },
      ],
      tips: ['Periodization: alternate heavy (strength) and volume weeks', 'Test 1RM every 8 weeks', 'Deload every 6th week', 'Monitor recovery — sleep, HRV, mood']
    },

    // ── MALE WEIGHT LOSS ──────────────────────────────────────────────────
    male_weight_loss_beginner: {
      schedule: '4 days/week', splitType: 'Full Body + Cardio',
      days: [
        { day: 'Monday', focus: 'Full Body Strength', exercises: [
          { name: 'Bodyweight Squat',    sets: '3', reps: '15', rest: '60s', muscle: 'Legs',     animation: 'squat' },
          { name: 'Push-ups',            sets: '3', reps: '12', rest: '60s', muscle: 'Chest',    animation: 'pushup' },
          { name: 'Dumbbell Row',        sets: '3', reps: '12', rest: '60s', muscle: 'Back',     animation: 'row' },
          { name: 'Plank',               sets: '3', reps: '40s', rest: '30s', muscle: 'Core',    animation: 'plank' },
          { name: 'Treadmill Walk',      sets: '1', reps: '20 min', rest: '–', muscle: 'Cardio', animation: 'run' },
        ]},
        { day: 'Tuesday', focus: 'HIIT Cardio', exercises: [
          { name: 'Jumping Jacks',       sets: '3', reps: '30s', rest: '20s', muscle: 'Full Body', animation: 'jumpingjack' },
          { name: 'High Knees',          sets: '3', reps: '30s', rest: '20s', muscle: 'Cardio',   animation: 'highknee' },
          { name: 'Burpees',             sets: '3', reps: '10', rest: '45s', muscle: 'Full Body',  animation: 'burpee' },
          { name: 'Mountain Climbers',   sets: '3', reps: '30s', rest: '20s', muscle: 'Core',      animation: 'mountainclimber' },
          { name: 'Jump Squats',         sets: '3', reps: '15', rest: '30s', muscle: 'Legs',       animation: 'squat' },
        ]},
        { day: 'Wednesday', focus: 'Rest / 30 min Walk', exercises: [] },
        { day: 'Thursday', focus: 'Upper Body', exercises: [
          { name: 'DB Shoulder Press',   sets: '3', reps: '12', rest: '60s', muscle: 'Shoulders', animation: 'press' },
          { name: 'Push-ups (Wide)',      sets: '3', reps: '12', rest: '60s', muscle: 'Chest',    animation: 'pushup' },
          { name: 'Lat Pulldown',        sets: '3', reps: '12', rest: '60s', muscle: 'Back',      animation: 'pulldown' },
          { name: 'Dumbbell Curl',       sets: '2', reps: '12', rest: '45s', muscle: 'Biceps',    animation: 'curl' },
          { name: 'Tricep Dips (bench)', sets: '2', reps: '12', rest: '45s', muscle: 'Triceps',   animation: 'dip' },
        ]},
        { day: 'Friday', focus: 'Lower Body + Core', exercises: [
          { name: 'Goblet Squat',        sets: '3', reps: '12', rest: '60s', muscle: 'Quads',     animation: 'squat' },
          { name: 'Lunges',              sets: '3', reps: '10 each', rest: '60s', muscle: 'Glutes', animation: 'lunge' },
          { name: 'Glute Bridge',        sets: '3', reps: '15', rest: '45s', muscle: 'Glutes',    animation: 'glutebridge' },
          { name: 'Leg Raises',          sets: '3', reps: '12', rest: '30s', muscle: 'Abs',       animation: 'legraise' },
          { name: 'Cycling 20 min',      sets: '1', reps: '20 min', rest: '–', muscle: 'Cardio',  animation: 'run' },
        ]},
        { day: 'Saturday', focus: 'Active Recovery / Yoga', exercises: [] },
        { day: 'Sunday', focus: 'Rest', exercises: [] },
      ],
      tips: ['Cardio after weights burns more fat', 'Don\'t starve — eat enough protein', 'Be consistent — results take 4–6 weeks to show', 'Track your weight weekly, same time, same conditions']
    },
    male_weight_loss_average: {
      schedule: '5 days/week', splitType: 'Upper Lower + HIIT',
      days: [
        { day: 'Monday', focus: 'Upper Strength', exercises: [
          { name: 'Bench Press',         sets: '4', reps: '10', rest: '75s', muscle: 'Chest',      animation: 'benchpress' },
          { name: 'Bent Over Row',       sets: '4', reps: '10', rest: '75s', muscle: 'Back',       animation: 'row' },
          { name: 'Overhead Press',      sets: '3', reps: '10', rest: '75s', muscle: 'Shoulders',  animation: 'press' },
          { name: 'Pull-ups',            sets: '3', reps: '8', rest: '90s', muscle: 'Back',        animation: 'pulldown' },
          { name: 'Plank',               sets: '3', reps: '60s', rest: '30s', muscle: 'Core',      animation: 'plank' },
        ]},
        { day: 'Tuesday', focus: 'Lower Strength', exercises: [
          { name: 'Barbell Squat',       sets: '4', reps: '10', rest: '2min', muscle: 'Quads',     animation: 'squat' },
          { name: 'Romanian Deadlift',   sets: '4', reps: '10', rest: '90s', muscle: 'Hamstrings', animation: 'deadlift' },
          { name: 'Walking Lunges',      sets: '3', reps: '12 each', rest: '75s', muscle: 'Glutes', animation: 'lunge' },
          { name: 'Leg Press',           sets: '3', reps: '12', rest: '75s', muscle: 'Quads',      animation: 'legpress' },
          { name: 'Calf Raises',         sets: '4', reps: '20', rest: '30s', muscle: 'Calves',     animation: 'calf' },
        ]},
        { day: 'Wednesday', focus: 'HIIT Cardio', exercises: [
          { name: 'Burpees',             sets: '5', reps: '12', rest: '30s', muscle: 'Full Body',  animation: 'burpee' },
          { name: 'Jump Squats',         sets: '5', reps: '15', rest: '30s', muscle: 'Legs',       animation: 'squat' },
          { name: 'Mountain Climbers',   sets: '5', reps: '40s', rest: '20s', muscle: 'Core',      animation: 'mountainclimber' },
          { name: 'Box Jumps',           sets: '4', reps: '10', rest: '45s', muscle: 'Power',      animation: 'squat' },
          { name: 'Sprint Intervals',    sets: '6', reps: '30s sprint / 90s walk', rest: '–', muscle: 'Cardio', animation: 'run' },
        ]},
        { day: 'Thursday', focus: 'Upper Volume', exercises: [
          { name: 'Incline DB Press',    sets: '4', reps: '12', rest: '60s', muscle: 'Upper Chest', animation: 'benchpress' },
          { name: 'Cable Row',           sets: '4', reps: '12', rest: '60s', muscle: 'Back',        animation: 'row' },
          { name: 'Lateral Raises',      sets: '4', reps: '15', rest: '45s', muscle: 'Shoulders',   animation: 'lateral' },
          { name: 'Bicep Curl',          sets: '3', reps: '12', rest: '45s', muscle: 'Biceps',      animation: 'curl' },
          { name: 'Tricep Pushdown',     sets: '3', reps: '12', rest: '45s', muscle: 'Triceps',     animation: 'tricep' },
        ]},
        { day: 'Friday', focus: 'Lower Volume + Abs', exercises: [
          { name: 'Leg Press',           sets: '4', reps: '15', rest: '60s', muscle: 'Quads',      animation: 'legpress' },
          { name: 'Leg Curl',            sets: '4', reps: '15', rest: '60s', muscle: 'Hamstrings', animation: 'legcurl' },
          { name: 'Glute Bridge',        sets: '3', reps: '20', rest: '45s', muscle: 'Glutes',     animation: 'glutebridge' },
          { name: 'Hanging Leg Raise',   sets: '4', reps: '15', rest: '45s', muscle: 'Core',       animation: 'legraise' },
          { name: 'Russian Twists',      sets: '4', reps: '20', rest: '30s', muscle: 'Obliques',   animation: 'crunch' },
        ]},
        { day: 'Saturday', focus: 'Cardio 40 min', exercises: [] },
        { day: 'Sunday', focus: 'Rest', exercises: [] },
      ],
      tips: ['Caloric deficit + strength training = best fat loss combo', 'Don\'t drop below 1600 cal for males', 'Cardio is a tool — don\'t overdo it', 'Protein 1.8g per kg to preserve muscle']
    },
    male_weight_loss_expert: {
      schedule: '6 days/week', splitType: 'PPL + Daily Cardio',
      days: [
        { day: 'Monday', focus: 'Push + HIIT Finisher', exercises: [
          { name: 'Bench Press',         sets: '4', reps: '8', rest: '90s', muscle: 'Chest',        animation: 'benchpress' },
          { name: 'Incline DB Press',    sets: '3', reps: '10', rest: '75s', muscle: 'Upper Chest', animation: 'benchpress' },
          { name: 'OHP',                 sets: '4', reps: '8', rest: '90s', muscle: 'Shoulders',    animation: 'press' },
          { name: 'Cable Fly',           sets: '3', reps: '15', rest: '45s', muscle: 'Chest',       animation: 'fly' },
          { name: 'Tricep Superset',     sets: '3', reps: '12 + 12', rest: '45s', muscle: 'Triceps', animation: 'tricep' },
          { name: 'HIIT: 6 x 30s sprint', sets: '1', reps: '15 min', rest: '–', muscle: 'Cardio',  animation: 'run' },
        ]},
        { day: 'Tuesday', focus: 'Pull + Core', exercises: [
          { name: 'Weighted Pull-ups',   sets: '4', reps: '6–8', rest: '2min', muscle: 'Lats',      animation: 'pulldown' },
          { name: 'Pendlay Row',         sets: '4', reps: '8', rest: '90s', muscle: 'Back',         animation: 'row' },
          { name: 'Face Pulls',          sets: '4', reps: '20', rest: '45s', muscle: 'Rear Delt',   animation: 'facepull' },
          { name: 'Incline DB Curl',     sets: '3', reps: '10', rest: '60s', muscle: 'Biceps',      animation: 'curl' },
          { name: 'Ab Circuit (3 moves)', sets: '3', reps: '15 each', rest: '30s', muscle: 'Core',  animation: 'crunch' },
        ]},
        { day: 'Wednesday', focus: 'Legs Heavy', exercises: [
          { name: 'Barbell Squat',       sets: '5', reps: '6', rest: '2.5min', muscle: 'Quads',     animation: 'squat' },
          { name: 'Stiff Leg Deadlift',  sets: '4', reps: '8', rest: '2min', muscle: 'Hamstrings',  animation: 'deadlift' },
          { name: 'Hack Squat',          sets: '3', reps: '10', rest: '90s', muscle: 'Quads',       animation: 'legpress' },
          { name: 'Seated Leg Curl',     sets: '3', reps: '12', rest: '60s', muscle: 'Hamstrings',  animation: 'legcurl' },
          { name: 'Calf Superset',       sets: '4', reps: '20', rest: '30s', muscle: 'Calves',      animation: 'calf' },
        ]},
        { day: 'Thursday', focus: 'Push Volume', exercises: [
          { name: 'DB Bench Press',      sets: '4', reps: '12', rest: '60s', muscle: 'Chest',       animation: 'benchpress' },
          { name: 'Arnold Press',        sets: '4', reps: '12', rest: '60s', muscle: 'Shoulders',   animation: 'press' },
          { name: 'Lateral Raises 4 sets', sets: '4', reps: '15–20', rest: '30s', muscle: 'Side Delt', animation: 'lateral' },
          { name: 'Close Grip Bench',    sets: '3', reps: '10', rest: '75s', muscle: 'Triceps',     animation: 'benchpress' },
          { name: 'Steady Cardio 30 min', sets: '1', reps: '30 min', rest: '–', muscle: 'Cardio',   animation: 'run' },
        ]},
        { day: 'Friday', focus: 'Pull Volume', exercises: [
          { name: 'Lat Pulldown',        sets: '4', reps: '12', rest: '60s', muscle: 'Lats',        animation: 'pulldown' },
          { name: 'Cable Row',           sets: '4', reps: '12', rest: '60s', muscle: 'Mid Back',    animation: 'row' },
          { name: 'Single Arm Row',      sets: '3', reps: '12', rest: '60s', muscle: 'Lats',        animation: 'row' },
          { name: 'EZ Bar Curl',         sets: '4', reps: '12', rest: '45s', muscle: 'Biceps',      animation: 'curl' },
          { name: 'Hammer Curl',         sets: '3', reps: '12', rest: '45s', muscle: 'Brachialis',  animation: 'curl' },
        ]},
        { day: 'Saturday', focus: 'Legs + Cardio', exercises: [
          { name: 'Leg Press',           sets: '4', reps: '15', rest: '75s', muscle: 'Quads',       animation: 'legpress' },
          { name: 'Lunges',              sets: '3', reps: '12', rest: '60s', muscle: 'Glutes',       animation: 'lunge' },
          { name: 'Leg Extension',       sets: '3', reps: '15', rest: '45s', muscle: 'Quads',       animation: 'legcurl' },
          { name: 'LISS Cardio 45 min',  sets: '1', reps: '45 min', rest: '–', muscle: 'Cardio',    animation: 'run' },
        ]},
        { day: 'Sunday', focus: 'Rest / Stretching', exercises: [] },
      ],
      tips: ['Carb cycle — high on leg/push days, low on pull/rest days', 'Fasted morning cardio 2–3x/week', 'Monitor body fat % every 2 weeks', 'Deload every 8 weeks']
    },

    // ── FEMALE WEIGHT GAIN ────────────────────────────────────────────────
    female_weight_gain_beginner: {
      schedule: '3 days/week', splitType: 'Full Body (Beginner)',
      days: [
        { day: 'Monday', focus: 'Full Body Strength A', exercises: [
          { name: 'Goblet Squat',        sets: '3', reps: '12', rest: '60s', muscle: 'Legs',      animation: 'squat' },
          { name: 'Push-ups (modified)', sets: '3', reps: '10', rest: '60s', muscle: 'Chest',     animation: 'pushup' },
          { name: 'Dumbbell Row',        sets: '3', reps: '10', rest: '60s', muscle: 'Back',      animation: 'row' },
          { name: 'Glute Bridge',        sets: '3', reps: '15', rest: '45s', muscle: 'Glutes',    animation: 'glutebridge' },
          { name: 'Plank',               sets: '3', reps: '25s', rest: '30s', muscle: 'Core',     animation: 'plank' },
        ]},
        { day: 'Tuesday', focus: 'Rest / 20 min Walk', exercises: [] },
        { day: 'Wednesday', focus: 'Full Body Strength B', exercises: [
          { name: 'Romanian Deadlift',   sets: '3', reps: '10', rest: '75s', muscle: 'Hamstrings', animation: 'deadlift' },
          { name: 'DB Shoulder Press',   sets: '3', reps: '10', rest: '60s', muscle: 'Shoulders',  animation: 'press' },
          { name: 'Lat Pulldown',        sets: '3', reps: '10', rest: '60s', muscle: 'Back',       animation: 'pulldown' },
          { name: 'Hip Thrust (BW)',     sets: '3', reps: '15', rest: '45s', muscle: 'Glutes',     animation: 'hipthrust' },
          { name: 'Bird Dog',            sets: '3', reps: '10 each', rest: '30s', muscle: 'Core',  animation: 'plank' },
        ]},
        { day: 'Thursday', focus: 'Rest / Yoga', exercises: [] },
        { day: 'Friday', focus: 'Full Body Strength C', exercises: [
          { name: 'Sumo Squat',          sets: '3', reps: '12', rest: '60s', muscle: 'Inner Thigh', animation: 'squat' },
          { name: 'Dumbbell Bench Press', sets: '3', reps: '10', rest: '60s', muscle: 'Chest',     animation: 'benchpress' },
          { name: 'Seated Row',          sets: '3', reps: '10', rest: '60s', muscle: 'Back',        animation: 'row' },
          { name: 'DB Lateral Raise',    sets: '2', reps: '12', rest: '45s', muscle: 'Shoulders',   animation: 'lateral' },
          { name: 'Crunches',            sets: '3', reps: '15', rest: '30s', muscle: 'Abs',         animation: 'crunch' },
        ]},
        { day: 'Saturday', focus: 'Light Walk / Stretching', exercises: [] },
        { day: 'Sunday', focus: 'Rest', exercises: [] },
      ],
      tips: ['Focus on form first, then increase weight', 'Don\'t be afraid of weights — they tone, not bulk', 'Progressive overload: add 1-2kg every 2 weeks', 'Track your workouts in a notebook']
    },
    female_weight_gain_average: {
      schedule: '4 days/week', splitType: 'Upper Lower Split',
      days: [
        { day: 'Monday', focus: 'Lower Body — Glutes + Legs', exercises: [
          { name: 'Barbell Squat',       sets: '4', reps: '10', rest: '90s', muscle: 'Quads',      animation: 'squat' },
          { name: 'Romanian Deadlift',   sets: '4', reps: '10', rest: '90s', muscle: 'Hamstrings', animation: 'deadlift' },
          { name: 'Hip Thrust (barbell)', sets: '4', reps: '12', rest: '75s', muscle: 'Glutes',    animation: 'hipthrust' },
          { name: 'Leg Press',           sets: '3', reps: '12', rest: '75s', muscle: 'Quads',      animation: 'legpress' },
          { name: 'Calf Raises',         sets: '3', reps: '20', rest: '30s', muscle: 'Calves',     animation: 'calf' },
        ]},
        { day: 'Tuesday', focus: 'Upper Body', exercises: [
          { name: 'Dumbbell Bench Press', sets: '3', reps: '10', rest: '75s', muscle: 'Chest',     animation: 'benchpress' },
          { name: 'Lat Pulldown',        sets: '4', reps: '10', rest: '75s', muscle: 'Back',       animation: 'pulldown' },
          { name: 'DB Shoulder Press',   sets: '3', reps: '10', rest: '75s', muscle: 'Shoulders',  animation: 'press' },
          { name: 'Cable Row',           sets: '3', reps: '12', rest: '60s', muscle: 'Mid Back',   animation: 'row' },
          { name: 'Lateral Raises',      sets: '3', reps: '15', rest: '45s', muscle: 'Side Delt',  animation: 'lateral' },
        ]},
        { day: 'Wednesday', focus: 'Rest / Yoga / Walk', exercises: [] },
        { day: 'Thursday', focus: 'Glutes + Hamstrings Focus', exercises: [
          { name: 'Sumo Deadlift',       sets: '4', reps: '10', rest: '90s', muscle: 'Glutes',     animation: 'deadlift' },
          { name: 'Cable Kickback',      sets: '4', reps: '15 each', rest: '45s', muscle: 'Glutes', animation: 'kickback' },
          { name: 'Curtsy Lunges',       sets: '3', reps: '12 each', rest: '60s', muscle: 'Glutes', animation: 'lunge' },
          { name: 'Leg Curl',            sets: '4', reps: '12', rest: '60s', muscle: 'Hamstrings', animation: 'legcurl' },
          { name: 'Single Leg Hip Thrust', sets: '3', reps: '12 each', rest: '60s', muscle: 'Glutes', animation: 'hipthrust' },
        ]},
        { day: 'Friday', focus: 'Upper Body + Arms', exercises: [
          { name: 'Push-ups (full)',      sets: '3', reps: '12', rest: '60s', muscle: 'Chest',      animation: 'pushup' },
          { name: 'DB Row',              sets: '4', reps: '10', rest: '60s', muscle: 'Back',        animation: 'row' },
          { name: 'Bicep Curl',          sets: '3', reps: '12', rest: '45s', muscle: 'Biceps',      animation: 'curl' },
          { name: 'Tricep Kickback',     sets: '3', reps: '12', rest: '45s', muscle: 'Triceps',     animation: 'tricep' },
          { name: 'Face Pulls',          sets: '3', reps: '15', rest: '45s', muscle: 'Rear Delt',   animation: 'facepull' },
        ]},
        { day: 'Saturday', focus: 'Active Recovery / Dance', exercises: [] },
        { day: 'Sunday', focus: 'Rest', exercises: [] },
      ],
      tips: ['Glutes and legs are priority for female toning', 'Hip thrusts are the best glute exercise', 'Protein 1.6g/kg to build lean muscle', 'Track measurements — the scale doesn\'t tell the full story']
    },
    female_weight_gain_expert: {
      schedule: '5 days/week', splitType: 'Glute Specialization + Push Pull',
      days: [
        { day: 'Monday', focus: 'Glutes Heavy', exercises: [
          { name: 'Barbell Hip Thrust',  sets: '5', reps: '8', rest: '2min', muscle: 'Glutes',     animation: 'hipthrust' },
          { name: 'Sumo Deadlift',       sets: '4', reps: '6–8', rest: '2min', muscle: 'Glutes',   animation: 'deadlift' },
          { name: 'Bulgarian Split Squat', sets: '4', reps: '8 each', rest: '90s', muscle: 'Quads+Glutes', animation: 'lunge' },
          { name: 'Cable Kickback',      sets: '4', reps: '15', rest: '45s', muscle: 'Glutes',     animation: 'kickback' },
          { name: 'Nordic Curl',         sets: '3', reps: '6', rest: '90s', muscle: 'Hamstrings',  animation: 'legcurl' },
        ]},
        { day: 'Tuesday', focus: 'Push (Upper)', exercises: [
          { name: 'Incline DB Press',    sets: '4', reps: '10', rest: '75s', muscle: 'Chest',       animation: 'benchpress' },
          { name: 'Arnold Press',        sets: '4', reps: '10', rest: '75s', muscle: 'Shoulders',   animation: 'press' },
          { name: 'Cable Fly',           sets: '3', reps: '12', rest: '60s', muscle: 'Chest',       animation: 'fly' },
          { name: 'Lateral Raise Drop Set', sets: '3', reps: '12→15→20', rest: '60s', muscle: 'Side Delt', animation: 'lateral' },
          { name: 'Tricep Overhead Ext', sets: '3', reps: '12', rest: '60s', muscle: 'Triceps',     animation: 'tricep' },
        ]},
        { day: 'Wednesday', focus: 'Legs Volume', exercises: [
          { name: 'Front Squat',         sets: '4', reps: '10', rest: '90s', muscle: 'Quads',       animation: 'squat' },
          { name: 'Leg Press',           sets: '4', reps: '15', rest: '75s', muscle: 'Quads',       animation: 'legpress' },
          { name: 'Leg Extension',       sets: '4', reps: '15', rest: '45s', muscle: 'Quads',       animation: 'legcurl' },
          { name: 'Lying Leg Curl',      sets: '4', reps: '12', rest: '60s', muscle: 'Hamstrings',  animation: 'legcurl' },
          { name: 'Calf Raise Superset', sets: '5', reps: '20', rest: '30s', muscle: 'Calves',      animation: 'calf' },
        ]},
        { day: 'Thursday', focus: 'Pull (Upper)', exercises: [
          { name: 'Weighted Pull-ups',   sets: '4', reps: '6–8', rest: '2min', muscle: 'Lats',      animation: 'pulldown' },
          { name: 'Cable Row',           sets: '4', reps: '10', rest: '75s', muscle: 'Mid Back',    animation: 'row' },
          { name: 'Face Pulls',          sets: '4', reps: '20', rest: '45s', muscle: 'Rear Delt',   animation: 'facepull' },
          { name: 'Hammer Curl',         sets: '3', reps: '12', rest: '45s', muscle: 'Biceps',      animation: 'curl' },
          { name: 'EZ Curl',             sets: '3', reps: '10', rest: '45s', muscle: 'Biceps',      animation: 'curl' },
        ]},
        { day: 'Friday', focus: 'Glutes + Core', exercises: [
          { name: 'Glute Focused RDL',   sets: '4', reps: '10', rest: '75s', muscle: 'Glutes',      animation: 'deadlift' },
          { name: 'Hip Abduction (cable)', sets: '4', reps: '15', rest: '45s', muscle: 'Glutes',    animation: 'kickback' },
          { name: 'Reverse Hyper',       sets: '3', reps: '15', rest: '45s', muscle: 'Glutes/Lower Back', animation: 'hipthrust' },
          { name: 'Ab Wheel Rollout',    sets: '4', reps: '10', rest: '45s', muscle: 'Core',        animation: 'plank' },
          { name: 'Side Plank',          sets: '3', reps: '45s each', rest: '30s', muscle: 'Obliques', animation: 'plank' },
        ]},
        { day: 'Saturday', focus: 'Active Recovery / Yoga', exercises: [] },
        { day: 'Sunday', focus: 'Rest', exercises: [] },
      ],
      tips: ['Glute activation warm-up before every leg session (clamshells, band walks)', 'Mind-muscle connection is crucial for glute development', 'Track glute measurements monthly', 'Periodize — 4 weeks volume, 2 weeks strength']
    },

    // ── FEMALE WEIGHT LOSS ────────────────────────────────────────────────
    female_weight_loss_beginner: {
      schedule: '4 days/week', splitType: 'Cardio + Light Strength',
      days: [
        { day: 'Monday', focus: 'Cardio + Upper Body', exercises: [
          { name: 'Treadmill Walk (incline)', sets: '1', reps: '15 min', rest: '–', muscle: 'Cardio', animation: 'run' },
          { name: 'Modified Push-ups', sets: '3', reps: '10', rest: '60s', muscle: 'Chest',          animation: 'pushup' },
          { name: 'Resistance Band Row', sets: '3', reps: '12', rest: '60s', muscle: 'Back',         animation: 'row' },
          { name: 'DB Lateral Raise', sets: '2', reps: '12', rest: '45s', muscle: 'Shoulders',       animation: 'lateral' },
          { name: 'Plank', sets: '3', reps: '20s', rest: '30s', muscle: 'Core',                      animation: 'plank' },
        ]},
        { day: 'Tuesday', focus: 'HIIT Light', exercises: [
          { name: 'Jumping Jacks', sets: '3', reps: '30s', rest: '30s', muscle: 'Cardio',            animation: 'jumpingjack' },
          { name: 'High Knees',   sets: '3', reps: '30s', rest: '30s', muscle: 'Cardio',             animation: 'highknee' },
          { name: 'Mountain Climbers', sets: '3', reps: '30s', rest: '30s', muscle: 'Core',           animation: 'mountainclimber' },
          { name: 'Squat Jumps', sets: '3', reps: '10', rest: '45s', muscle: 'Legs',                 animation: 'squat' },
          { name: 'Skipping Rope', sets: '1', reps: '10 min', rest: '–', muscle: 'Cardio',           animation: 'run' },
        ]},
        { day: 'Wednesday', focus: 'Rest / 30 min Walk', exercises: [] },
        { day: 'Thursday', focus: 'Lower Body Toning', exercises: [
          { name: 'Bodyweight Squat', sets: '4', reps: '15', rest: '60s', muscle: 'Legs',            animation: 'squat' },
          { name: 'Glute Bridge',     sets: '4', reps: '15', rest: '45s', muscle: 'Glutes',          animation: 'glutebridge' },
          { name: 'Side Lunges',      sets: '3', reps: '10 each', rest: '60s', muscle: 'Thighs',     animation: 'lunge' },
          { name: 'Donkey Kicks',     sets: '3', reps: '15 each', rest: '30s', muscle: 'Glutes',     animation: 'kickback' },
          { name: 'Calf Raises',      sets: '3', reps: '20', rest: '30s', muscle: 'Calves',          animation: 'calf' },
        ]},
        { day: 'Friday', focus: 'Core + Cardio', exercises: [
          { name: 'Crunches',     sets: '3', reps: '20', rest: '30s', muscle: 'Abs',                 animation: 'crunch' },
          { name: 'Leg Raises',   sets: '3', reps: '12', rest: '30s', muscle: 'Lower Abs',           animation: 'legraise' },
          { name: 'Side Plank',   sets: '3', reps: '20s each', rest: '30s', muscle: 'Obliques',      animation: 'plank' },
          { name: 'Cycling / Zumba', sets: '1', reps: '20 min', rest: '–', muscle: 'Cardio',         animation: 'run' },
        ]},
        { day: 'Saturday', focus: 'Zumba / Dance', exercises: [] },
        { day: 'Sunday', focus: 'Rest', exercises: [] },
      ],
      tips: ['Start gentle — soreness is normal, pain is not', 'Walk daily even on rest days', 'Results take 6–8 weeks — be patient', 'Don\'t compare yourself to others']
    },
    female_weight_loss_average: {
      schedule: '5 days/week', splitType: 'Strength + HIIT Combo',
      days: [
        { day: 'Monday', focus: 'Lower Body + Glutes', exercises: [
          { name: 'Goblet Squat',        sets: '4', reps: '12', rest: '75s', muscle: 'Quads',         animation: 'squat' },
          { name: 'Hip Thrust',          sets: '4', reps: '15', rest: '60s', muscle: 'Glutes',         animation: 'hipthrust' },
          { name: 'Romanian Deadlift',   sets: '3', reps: '12', rest: '75s', muscle: 'Hamstrings',     animation: 'deadlift' },
          { name: 'Cable Kickback',      sets: '3', reps: '15 each', rest: '45s', muscle: 'Glutes',    animation: 'kickback' },
          { name: 'Side Lying Leg Raise', sets: '3', reps: '15 each', rest: '30s', muscle: 'Hip Abductor', animation: 'kickback' },
        ]},
        { day: 'Tuesday', focus: 'HIIT + Core', exercises: [
          { name: 'Burpees',             sets: '4', reps: '12', rest: '30s', muscle: 'Full Body',      animation: 'burpee' },
          { name: 'Jump Squats',         sets: '4', reps: '15', rest: '30s', muscle: 'Legs',           animation: 'squat' },
          { name: 'High Knees',          sets: '4', reps: '40s', rest: '20s', muscle: 'Cardio',        animation: 'highknee' },
          { name: 'Plank to Push-up',    sets: '3', reps: '10', rest: '30s', muscle: 'Core + Chest',   animation: 'pushup' },
          { name: 'Russian Twists',      sets: '4', reps: '20', rest: '30s', muscle: 'Obliques',       animation: 'crunch' },
        ]},
        { day: 'Wednesday', focus: 'Upper Body', exercises: [
          { name: 'Lat Pulldown',        sets: '4', reps: '12', rest: '60s', muscle: 'Back',           animation: 'pulldown' },
          { name: 'DB Shoulder Press',   sets: '3', reps: '12', rest: '60s', muscle: 'Shoulders',      animation: 'press' },
          { name: 'Push-ups',            sets: '3', reps: '12', rest: '60s', muscle: 'Chest',          animation: 'pushup' },
          { name: 'Bicep Curl',          sets: '3', reps: '12', rest: '45s', muscle: 'Biceps',         animation: 'curl' },
          { name: 'Tricep Dips (bench)', sets: '3', reps: '12', rest: '45s', muscle: 'Triceps',        animation: 'dip' },
        ]},
        { day: 'Thursday', focus: 'Lower Body Volume', exercises: [
          { name: 'Walking Lunges',      sets: '4', reps: '12 each', rest: '60s', muscle: 'Glutes',    animation: 'lunge' },
          { name: 'Leg Press',           sets: '4', reps: '15', rest: '60s', muscle: 'Quads',          animation: 'legpress' },
          { name: 'Sumo Squat',          sets: '3', reps: '15', rest: '60s', muscle: 'Inner Thigh',    animation: 'squat' },
          { name: 'Leg Curl',            sets: '3', reps: '12', rest: '60s', muscle: 'Hamstrings',     animation: 'legcurl' },
          { name: 'Calf Raises',         sets: '4', reps: '20', rest: '30s', muscle: 'Calves',         animation: 'calf' },
        ]},
        { day: 'Friday', focus: 'Full Body Circuit', exercises: [
          { name: 'Deadlift (moderate)', sets: '3', reps: '10', rest: '90s', muscle: 'Full Body',      animation: 'deadlift' },
          { name: 'DB Row',              sets: '3', reps: '12', rest: '60s', muscle: 'Back',            animation: 'row' },
          { name: 'Goblet Squat',        sets: '3', reps: '12', rest: '60s', muscle: 'Quads',          animation: 'squat' },
          { name: 'Lateral Raises',      sets: '3', reps: '15', rest: '45s', muscle: 'Shoulders',      animation: 'lateral' },
          { name: 'Hanging Leg Raise',   sets: '3', reps: '12', rest: '45s', muscle: 'Core',           animation: 'legraise' },
        ]},
        { day: 'Saturday', focus: 'Cardio (Dance / Cycling)', exercises: [] },
        { day: 'Sunday', focus: 'Rest', exercises: [] },
      ],
      tips: ['Strength + HIIT combo is best for female fat loss', 'Don\'t fear building muscle — it speeds metabolism', 'Consistency over 12 weeks gives real results', 'Hormonal cycle affects energy — adjust intensity accordingly']
    },
    female_weight_loss_expert: {
      schedule: '6 days/week', splitType: 'PPL + Glute Priority + Cardio',
      days: [
        { day: 'Monday', focus: 'Glutes + Hamstrings (Heavy)', exercises: [
          { name: 'Barbell Hip Thrust',  sets: '5', reps: '8', rest: '2min', muscle: 'Glutes',         animation: 'hipthrust' },
          { name: 'Sumo Deadlift',       sets: '4', reps: '6–8', rest: '2min', muscle: 'Posterior Chain', animation: 'deadlift' },
          { name: 'Cable Kickback',      sets: '4', reps: '15', rest: '45s', muscle: 'Glutes',          animation: 'kickback' },
          { name: 'Leg Curl',            sets: '4', reps: '10', rest: '60s', muscle: 'Hamstrings',      animation: 'legcurl' },
          { name: 'HIIT Finisher 10 min', sets: '1', reps: '10 min', rest: '–', muscle: 'Cardio',       animation: 'run' },
        ]},
        { day: 'Tuesday', focus: 'Push + Core', exercises: [
          { name: 'Incline DB Press',    sets: '4', reps: '10', rest: '75s', muscle: 'Chest',           animation: 'benchpress' },
          { name: 'Arnold Press',        sets: '4', reps: '10', rest: '75s', muscle: 'Shoulders',       animation: 'press' },
          { name: 'Lateral Raise 4×15',  sets: '4', reps: '15', rest: '30s', muscle: 'Side Delt',       animation: 'lateral' },
          { name: 'Tricep Pushdown',     sets: '3', reps: '12', rest: '45s', muscle: 'Triceps',         animation: 'tricep' },
          { name: 'Ab Circuit',          sets: '3', reps: '15 each', rest: '30s', muscle: 'Core',       animation: 'crunch' },
        ]},
        { day: 'Wednesday', focus: 'Pull + Cardio', exercises: [
          { name: 'Pull-ups',            sets: '4', reps: '8', rest: '90s', muscle: 'Lats',             animation: 'pulldown' },
          { name: 'Cable Row',           sets: '4', reps: '12', rest: '60s', muscle: 'Back',            animation: 'row' },
          { name: 'Face Pulls',          sets: '4', reps: '20', rest: '45s', muscle: 'Rear Delt',       animation: 'facepull' },
          { name: 'Hammer Curl',         sets: '3', reps: '12', rest: '45s', muscle: 'Biceps',          animation: 'curl' },
          { name: 'LISS 30 min',         sets: '1', reps: '30 min', rest: '–', muscle: 'Cardio',        animation: 'run' },
        ]},
        { day: 'Thursday', focus: 'Legs (Quad Focus)', exercises: [
          { name: 'Front Squat',         sets: '4', reps: '8', rest: '90s', muscle: 'Quads',            animation: 'squat' },
          { name: 'Leg Press (narrow)',   sets: '4', reps: '12', rest: '75s', muscle: 'Quads',           animation: 'legpress' },
          { name: 'Bulgarian Split Squat', sets: '3', reps: '10 each', rest: '90s', muscle: 'Quads+Glutes', animation: 'lunge' },
          { name: 'Leg Extension',       sets: '4', reps: '15', rest: '45s', muscle: 'Quads',           animation: 'legcurl' },
          { name: 'Calf Superset',       sets: '5', reps: '20', rest: '30s', muscle: 'Calves',          animation: 'calf' },
        ]},
        { day: 'Friday', focus: 'Glutes + Abs', exercises: [
          { name: 'Single Leg Hip Thrust', sets: '4', reps: '12 each', rest: '75s', muscle: 'Glutes',   animation: 'hipthrust' },
          { name: 'Reverse Hyper',       sets: '3', reps: '15', rest: '45s', muscle: 'Lower Glutes',    animation: 'hipthrust' },
          { name: 'Frog Pumps',          sets: '3', reps: '20', rest: '30s', muscle: 'Glutes',          animation: 'glutebridge' },
          { name: 'Hanging Leg Raise',   sets: '4', reps: '12', rest: '45s', muscle: 'Lower Abs',       animation: 'legraise' },
          { name: 'Cable Crunch',        sets: '4', reps: '15', rest: '30s', muscle: 'Upper Abs',       animation: 'crunch' },
        ]},
        { day: 'Saturday', focus: 'Active Cardio (Cycling / Swimming)', exercises: [] },
        { day: 'Sunday', focus: 'Rest', exercises: [] },
      ],
      tips: ['Fasted LISS cardio 2–3x/week for accelerated fat loss', 'Glute activation warm-up every session', 'Carb cycle around your menstrual cycle', 'Track body fat % every 3 weeks', 'Deload week every 8 weeks']
    }
  };

  const key = `${gender}_${goal}_${fitnessLevel}`;
  return plans[key] || plans[`${gender}_${goal}_beginner`];
};

// ── GET /api/client/diet-plan ─────────────────────────────────────────────────
router.get('/diet-plan',protect, approvedClientOnly, async (req, res, next) => {
  const { gender, goal, fitnessLevel, age, weight } = req.user;
  if (!gender || !goal || !fitnessLevel)
    return res.status(400).json({ message: 'Profile incomplete. Gender, goal and fitness level are required.' });
  const plan = getDietPlan(gender, goal, fitnessLevel, age || 25, weight || 70);
  res.json(plan);
});

// ── GET /api/client/workout-plan ──────────────────────────────────────────────
router.get('/workout-plan',protect, approvedClientOnly, async (req, res,next) => {
  const { gender, goal, fitnessLevel } = req.user;
  if (!gender || !goal || !fitnessLevel)
    return res.status(400).json({ message: 'Profile incomplete. Gender, goal and fitness level are required.' });
  const plan = getWorkoutPlan(gender, goal, fitnessLevel);
  res.json(plan);
});

// ── POST /api/client/attendance ───────────────────────────────────────────────
router.post('/attendance',protect, approvedClientOnly, async (req, res, next) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const existing = await Attendance.findOne({ userId: req.user._id, date: today });
    if (existing) return res.status(400).json({ message: 'Attendance already marked for today!' });
    const attendance = await Attendance.create({ userId: req.user._id, date: today, present: true });
    res.status(201).json({ message: 'Attendance marked!', attendance });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── GET /api/client/streak ────────────────────────────────────────────────────
router.get('/streak',protect, approvedClientOnly, async (req, res, next) => {
  try {
    const records = await Attendance.find({ userId: req.user._id, present: true }).sort({ date: 1 });
    let currentStreak = 0;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    let checkDate = new Date(today);
    const dateSet = new Set(records.map(r => new Date(r.date).toDateString()));
    while (dateSet.has(checkDate.toDateString())) { currentStreak++; checkDate.setDate(checkDate.getDate() - 1); }
    let longestStreak = 0, tempStreak = 0;
    for (let i = 0; i < records.length; i++) {
      if (i === 0) { tempStreak = 1; continue; }
      const diff = (new Date(records[i].date) - new Date(records[i-1].date)) / (1000 * 60 * 60 * 24);
      tempStreak = diff === 1 ? tempStreak + 1 : 1;
      longestStreak = Math.max(longestStreak, tempStreak);
    }
    longestStreak = Math.max(longestStreak, tempStreak);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthRecords = records.filter(r => new Date(r.date) >= monthStart);
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    res.json({ records, currentStreak, longestStreak, thisMonthCount: monthRecords.length, daysInMonth, attendancePercent: Math.round((monthRecords.length / daysInMonth) * 100), markedToday: dateSet.has(today.toDateString()) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── POST /api/client/feedback ─────────────────────────────────────────────────
router.post('/feedback', protect, approvedClientOnly,async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const feedback = await Feedback.create({ userId: req.user._id, name: req.user.name, rating, comment });
    res.status(201).json({ message: 'Feedback submitted!', feedback });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── POST /api/client/progress-note ───────────────────────────────────────────
router.post('/progress-note', protect, approvedClientOnly,async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.progressNotes.push({ text: req.body.text });
    await user.save();
    res.json({ notes: [...user.progressNotes].reverse() });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── GET /api/client/progress-notes ───────────────────────────────────────────
router.get('/progress-notes',protect, approvedClientOnly, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('progressNotes');
    res.json([...user.progressNotes].reverse());
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── DELETE /api/client/progress-note/:index ──────────────────────────────────
router.delete('/progress-note/:index', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.progressNotes.splice(req.params.index, 1);
    await user.save();
    res.json({ notes: [...user.progressNotes].reverse() });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
