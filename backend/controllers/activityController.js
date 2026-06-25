const Activity = require('../models/Activity');
const User = require('../models/User');
const { checkAndAwardAchievements } = require('../utils/achievements');

// Helper: Get start and end of day in local/UTC timezone
const getDayBounds = (dateString) => {
  const date = dateString ? new Date(dateString) : new Date();
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  return { startOfDay, endOfDay };
};

// @desc    Get all activities for logged-in user
// @route   GET /api/activities
// @access  Private
const getActivities = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    let query = { userId: req.user._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    const activities = await Activity.find(query).sort({ date: -1 });

    res.json({
      success: true,
      count: activities.length,
      data: activities
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get or create daily activity for today
// @route   GET /api/activities/today
// @access  Private
const getTodayActivity = async (req, res, next) => {
  try {
    const { startOfDay, endOfDay } = getDayBounds();

    let activity = await Activity.findOne({
      userId: req.user._id,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    // If no activity exists for today, create one
    if (!activity) {
      activity = await Activity.create({
        userId: req.user._id,
        date: new Date(),
        steps: 0,
        distance: 0,
        activeMinutes: 0,
        sleepDuration: 0,
        waterIntake: 0
      });
    }

    res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update daily activity (steps, sleep, activeMinutes, etc.)
// @route   PUT /api/activities/today
// @access  Private
const updateActivity = async (req, res, next) => {
  try {
    const { startOfDay, endOfDay } = getDayBounds();
    const { steps, sleepDuration, activeMinutes, waterIntake } = req.body;

    let activity = await Activity.findOne({
      userId: req.user._id,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (!activity) {
      activity = new Activity({
        userId: req.user._id,
        date: new Date()
      });
    }

    if (steps !== undefined) {
      activity.steps = Number(steps);
      // Average stride length = 0.75m. Steps * 0.75 / 1000 = distance in km
      activity.distance = parseFloat((activity.steps * 0.00075).toFixed(2));
    }
    if (sleepDuration !== undefined) activity.sleepDuration = Number(sleepDuration);
    if (activeMinutes !== undefined) activity.activeMinutes = Number(activeMinutes);
    if (waterIntake !== undefined) activity.waterIntake = Number(waterIntake);

    await activity.save();

    // Check for achievements (Century Walker, Hydration Hero, Sleep Master)
    const user = await User.findById(req.user._id);
    await checkAndAwardAchievements(user);

    res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Increment water intake for today
// @route   PATCH /api/activities/water
// @access  Private
const incrementWater = async (req, res, next) => {
  try {
    const { amount } = req.body; // e.g. 250 ml
    
    if (!amount || Number(amount) <= 0) {
      res.status(400);
      throw new Error('Please specify a positive water amount to increment');
    }

    const { startOfDay, endOfDay } = getDayBounds();

    let activity = await Activity.findOne({
      userId: req.user._id,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (!activity) {
      activity = await Activity.create({
        userId: req.user._id,
        date: new Date(),
        waterIntake: 0
      });
    }

    activity.waterIntake += Number(amount);
    await activity.save();

    // Check for achievements (Hydration Hero)
    const user = await User.findById(req.user._id);
    await checkAndAwardAchievements(user);

    res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Increment steps count for today
// @route   PATCH /api/activities/steps
// @access  Private
const incrementSteps = async (req, res, next) => {
  try {
    const { count } = req.body;
    
    if (!count || Number(count) <= 0) {
      res.status(400);
      throw new Error('Please specify steps count to increment');
    }

    const { startOfDay, endOfDay } = getDayBounds();

    let activity = await Activity.findOne({
      userId: req.user._id,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (!activity) {
      activity = await Activity.create({
        userId: req.user._id,
        date: new Date(),
        steps: 0,
        distance: 0
      });
    }

    activity.steps += Number(count);
    activity.distance = parseFloat((activity.steps * 0.00075).toFixed(2));
    await activity.save();

    // Check for achievements (Century Walker)
    const user = await User.findById(req.user._id);
    await checkAndAwardAchievements(user);

    res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActivities,
  getTodayActivity,
  updateActivity,
  incrementWater,
  incrementSteps
};
