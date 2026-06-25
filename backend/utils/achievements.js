const Workout = require('../models/Workout');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');

const BADGES = {
  FIRST_WORKOUT: {
    badgeId: 'first_workout',
    title: 'First Step',
    description: 'Logged your very first workout. Keep it up!'
  },
  CENTURY_WALKER: {
    badgeId: 'century_walker',
    title: 'Century Walker',
    description: 'Walked 10,000 or more steps in a single day!'
  },
  WORKOUT_WARRIOR: {
    badgeId: 'workout_warrior',
    title: 'Workout Warrior',
    description: 'Completed 5 gym workouts!'
  },
  HYDRATION_HERO: {
    badgeId: 'hydration_hero',
    title: 'Hydration Hero',
    description: 'Drank 3,000ml or more of water in a single day!'
  },
  SLEEP_MASTER: {
    badgeId: 'sleep_master',
    title: 'Sleep Master',
    description: 'Slept 8 or more hours to maximize recovery!'
  },
  GOAL_CRUSHER: {
    badgeId: 'goal_crusher',
    title: 'Goal Crusher',
    description: 'Successfully reached your target weight or completed a goal!'
  }
};

/**
 * Evaluates user stats and awards badges if earned.
 * Returns newly unlocked badges.
 */
const checkAndAwardAchievements = async (user) => {
  const newlyUnlocked = [];
  const currentBadgeIds = user.achievements.map(b => b.badgeId);

  try {
    // 1. Check FIRST_WORKOUT
    if (!currentBadgeIds.includes(BADGES.FIRST_WORKOUT.badgeId)) {
      const workoutCount = await Workout.countDocuments({ userId: user._id });
      if (workoutCount > 0) {
        newlyUnlocked.push(BADGES.FIRST_WORKOUT);
      }
    }

    // 2. Check CENTURY_WALKER (steps >= 10,000)
    if (!currentBadgeIds.includes(BADGES.CENTURY_WALKER.badgeId)) {
      const tenKDay = await Activity.findOne({ userId: user._id, steps: { $gte: 10000 } });
      if (tenKDay) {
        newlyUnlocked.push(BADGES.CENTURY_WALKER);
      }
    }

    // 3. Check WORKOUT_WARRIOR (gym workouts >= 5)
    if (!currentBadgeIds.includes(BADGES.WORKOUT_WARRIOR.badgeId)) {
      const gymCount = await Workout.countDocuments({ userId: user._id, category: 'Gym' });
      if (gymCount >= 5) {
        newlyUnlocked.push(BADGES.WORKOUT_WARRIOR);
      }
    }

    // 4. Check HYDRATION_HERO (water >= 3000 ml)
    if (!currentBadgeIds.includes(BADGES.HYDRATION_HERO.badgeId)) {
      const highWaterDay = await Activity.findOne({ userId: user._id, waterIntake: { $gte: 3000 } });
      if (highWaterDay) {
        newlyUnlocked.push(BADGES.HYDRATION_HERO);
      }
    }

    // 5. Check SLEEP_MASTER (sleep >= 8 hours)
    if (!currentBadgeIds.includes(BADGES.SLEEP_MASTER.badgeId)) {
      const sleepDay = await Activity.findOne({ userId: user._id, sleepDuration: { $gte: 8 } });
      if (sleepDay) {
        newlyUnlocked.push(BADGES.SLEEP_MASTER);
      }
    }

    // 6. Check GOAL_CRUSHER (weight <= targetWeight if targetWeight is set, or target reached)
    if (!currentBadgeIds.includes(BADGES.GOAL_CRUSHER.badgeId)) {
      if (user.targetWeight > 0 && user.weight > 0) {
        // Assume user wants to lose weight if target < current, or gain weight if target > current
        const startWeightObj = user.weightHistory[0];
        const startingWeight = startWeightObj ? startWeightObj.weight : user.weight;
        
        const isLossGoalMet = startingWeight > user.targetWeight && user.weight <= user.targetWeight;
        const isGainGoalMet = startingWeight < user.targetWeight && user.weight >= user.targetWeight;

        if (isLossGoalMet || isGainGoalMet) {
          newlyUnlocked.push(BADGES.GOAL_CRUSHER);
        }
      }
    }

    // If there are new badges, save them to the user and create notifications
    if (newlyUnlocked.length > 0) {
      for (const badge of newlyUnlocked) {
        user.achievements.push({
          badgeId: badge.badgeId,
          title: badge.title,
          description: badge.description,
          unlockedAt: new Date()
        });

        // Create notification
        await Notification.create({
          userId: user._id,
          title: `🏆 New Achievement: ${badge.title}!`,
          message: badge.description,
          type: 'Achievement'
        });
      }
      
      await user.save();
    }
  } catch (error) {
    console.error(`Error checking achievements: ${error.message}`);
  }

  return newlyUnlocked;
};

module.exports = { checkAndAwardAchievements, BADGES };
