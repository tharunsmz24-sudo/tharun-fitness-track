const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');
const Workout = require('../models/Workout');
const DietRecord = require('../models/DietRecord');
const Activity = require('../models/Activity');
const Goal = require('../models/Goal');
const Notification = require('../models/Notification');

dotenv.config();

// Connect to MongoDB
const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fittrack');
    console.log('MongoDB connected for seeding...');
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connect();

    // Clean all collections
    await User.deleteMany();
    await Workout.deleteMany();
    await DietRecord.deleteMany();
    await Activity.deleteMany();
    await Goal.deleteMany();
    await Notification.deleteMany();

    console.log('Existing data cleared.');

    // 1. Create Users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Initial weight history for demo user
    const demoWeightHistory = [];
    const baseWeight = 82; // kg
    for (let i = 14; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      // simulate weight loss: start at 83.5kg, end at 81.2kg
      const weight = parseFloat((baseWeight - 0.15 * (14 - i) + Math.random() * 0.4).toFixed(1));
      demoWeightHistory.push({ weight, date });
    }

    const demoUser = await User.create({
      name: 'Demo User',
      email: 'demo@fittrack.com',
      password: 'password123', // Will be hashed via pre-save but since we are seeding, let's let Mongoose hook handle it or seed directly. Wait, mongoose pre-save hook handles password hashing! So we should pass the raw password!
      role: 'user',
      height: 178, // cm
      weight: 81.2, // current weight
      targetWeight: 75, // target weight
      targetCalories: 2200,
      targetWater: 3000,
      targetSteps: 10000,
      weightHistory: demoWeightHistory,
      achievements: [
        {
          badgeId: 'first_workout',
          title: 'First Step',
          description: 'Logged your very first workout. Keep it up!',
          unlockedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
        },
        {
          badgeId: 'century_walker',
          title: 'Century Walker',
          description: 'Walked 10,000 or more steps in a single day!',
          unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        }
      ]
    });

    const adminUser = await User.create({
      name: 'Admin Coach',
      email: 'admin@fittrack.com',
      password: 'password123',
      role: 'admin',
      height: 182,
      weight: 85,
      targetWeight: 80,
      weightHistory: [{ weight: 85, date: new Date() }],
      achievements: []
    });

    console.log('Users created successfully.');

    // 2. Create Activities for the last 14 days
    const activities = [];
    for (let i = 14; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      // Daily variance in steps and water
      const steps = Math.floor(6000 + Math.random() * 8000); // 6k - 14k steps
      const waterIntake = Math.floor(1500 + Math.random() * 2000); // 1.5L - 3.5L
      const sleepDuration = parseFloat((6 + Math.random() * 3.5).toFixed(1)); // 6h - 9.5h
      const activeMinutes = Math.floor(20 + Math.random() * 90); // 20m - 110m

      activities.push({
        userId: demoUser._id,
        steps,
        distance: parseFloat((steps * 0.00075).toFixed(2)),
        activeMinutes,
        sleepDuration,
        waterIntake,
        date
      });
    }
    await Activity.insertMany(activities);
    console.log('Activity records seeded.');

    // 3. Create Workouts
    const categories = ['Running', 'Gym', 'Cycling', 'Yoga', 'Swimming'];
    const workoutNotes = [
      'Morning jog around the park. Felt great!',
      'Heavy push day at the gym. Bench press, shoulder press, triceps.',
      'Evening bike ride. Moderate headwind.',
      'Restorative vinyasa flow. Focused on hamstrings and back.',
      'Laps in the community pool. 1000m total.'
    ];

    const workouts = [];
    for (let i = 12; i >= 0; i -= 2) {
      // Create a workout every 2 days
      const date = new Date();
      date.setDate(date.getDate() - i);
      const catIdx = Math.floor(Math.random() * categories.length);
      const category = categories[catIdx];
      const duration = 30 + Math.floor(Math.random() * 60); // 30 - 90 mins
      const caloriesBurned = duration * (category === 'Running' ? 10 : category === 'Gym' ? 7 : category === 'Cycling' ? 8 : category === 'Yoga' ? 4 : 9);

      workouts.push({
        userId: demoUser._id,
        category,
        duration,
        caloriesBurned,
        notes: workoutNotes[catIdx] + ` (Logged on day -${i})`,
        date
      });
    }
    await Workout.insertMany(workouts);
    console.log('Workouts seeded.');

    // 4. Create Diet Records
    const meals = [
      {
        mealType: 'Breakfast',
        foodItems: [
          { name: 'Oatmeal with Banana & Honey', calories: 380, protein: 12, carbs: 65, fat: 6 },
          { name: 'Scrambled Eggs (2)', calories: 140, protein: 12, carbs: 1, fat: 10 },
          { name: 'Black Coffee', calories: 2, protein: 0, carbs: 0, fat: 0 }
        ]
      },
      {
        mealType: 'Lunch',
        foodItems: [
          { name: 'Grilled Chicken Breast', calories: 280, protein: 48, carbs: 0, fat: 6 },
          { name: 'Brown Rice (1 cup)', calories: 215, protein: 5, carbs: 45, fat: 2 },
          { name: 'Mixed Vegetables', calories: 80, protein: 3, carbs: 15, fat: 1 }
        ]
      },
      {
        mealType: 'Dinner',
        foodItems: [
          { name: 'Baked Salmon Fillet', calories: 320, protein: 34, carbs: 0, fat: 18 },
          { name: 'Sweet Potato (Medium)', calories: 160, protein: 3, carbs: 37, fat: 0 },
          { name: 'Steamed Broccoli', calories: 50, protein: 4, carbs: 10, fat: 0 }
        ]
      },
      {
        mealType: 'Snacks',
        foodItems: [
          { name: 'Whey Protein Shake', calories: 140, protein: 24, carbs: 3, fat: 2 },
          { name: 'Almonds (1 oz)', calories: 160, protein: 6, carbs: 6, fat: 14 }
        ]
      }
    ];

    const dietRecords = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      for (const meal of meals) {
        // Add random variance to meals
        const foodItems = meal.foodItems.map(item => ({
          ...item,
          calories: Math.round(item.calories * (0.9 + Math.random() * 0.2)),
          protein: Math.round(item.protein * (0.9 + Math.random() * 0.2)),
          carbs: Math.round(item.carbs * (0.9 + Math.random() * 0.2)),
          fat: Math.round(item.fat * (0.9 + Math.random() * 0.2))
        }));

        const totalCalories = foodItems.reduce((sum, f) => sum + f.calories, 0);
        const totalProtein = foodItems.reduce((sum, f) => sum + f.protein, 0);
        const totalCarbs = foodItems.reduce((sum, f) => sum + f.carbs, 0);
        const totalFat = foodItems.reduce((sum, f) => sum + f.fat, 0);

        dietRecords.push({
          userId: demoUser._id,
          mealType: meal.mealType,
          foodItems,
          totalCalories,
          totalProtein,
          totalCarbs,
          totalFat,
          date
        });
      }
    }
    await DietRecord.insertMany(dietRecords);
    console.log('Diet records seeded.');

    // 5. Create Goals
    await Goal.create([
      {
        userId: demoUser._id,
        type: 'Steps',
        targetValue: 12000,
        currentValue: 9800,
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        status: 'Active'
      },
      {
        userId: demoUser._id,
        type: 'Weight',
        targetValue: 78,
        currentValue: 81.2,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'Active'
      },
      {
        userId: demoUser._id,
        type: 'Workouts',
        targetValue: 10,
        currentValue: 7,
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        status: 'Active'
      },
      {
        userId: demoUser._id,
        type: 'Water',
        targetValue: 3000,
        currentValue: 3200,
        deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: 'Completed'
      }
    ]);
    console.log('Goals seeded.');

    // 6. Create Notifications
    await Notification.create([
      {
        userId: demoUser._id,
        title: '💧 Hydration Check!',
        message: "You are doing great today! Only 500ml left to reach your daily water goal.",
        type: 'Reminder',
        read: false
      },
      {
        userId: demoUser._id,
        title: '🏆 Achievement Unlocked: Century Walker!',
        message: 'You walked over 10,000 steps yesterday! Incredible job.',
        type: 'Achievement',
        read: false
      },
      {
        userId: demoUser._id,
        title: '🏃‍♂️ Workout Reminder',
        message: "Time to sweat! You have a Gym session scheduled for this afternoon.",
        type: 'Reminder',
        read: true
      }
    ]);
    console.log('Notifications seeded.');

    console.log('\n=========================================');
    console.log('FITTRACK PRO DATABASE SEEDED SUCCESSFULLY!');
    console.log('Demo User:  demo@fittrack.com  / password123');
    console.log('Admin User: admin@fittrack.com / password123');
    console.log('=========================================\n');

    process.exit(0);
  } catch (error) {
    console.error(`Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedData();
