const Goal = require('../models/Goal');
const Activity = require('../models/Activity');
const Workout = require('../models/Workout');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { checkAndAwardAchievements } = require('../utils/achievements');

// Helper to auto-update goal progress based on user stats
const syncGoalProgress = async (userId) => {
  try {
    const activeGoals = await Goal.find({ userId, status: 'Active' });
    if (activeGoals.length === 0) return;

    // Get today's bounds
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch today's activity metrics
    const todayActivity = await Activity.findOne({
      userId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    const user = await User.findById(userId);

    for (let goal of activeGoals) {
      let updatedCurrentValue = goal.currentValue;
      let isCompleted = false;

      if (goal.type === 'Steps' && todayActivity) {
        updatedCurrentValue = todayActivity.steps;
        isCompleted = updatedCurrentValue >= goal.targetValue;
      } else if (goal.type === 'Water' && todayActivity) {
        updatedCurrentValue = todayActivity.waterIntake;
        isCompleted = updatedCurrentValue >= goal.targetValue;
      } else if (goal.type === 'Sleep' && todayActivity) {
        updatedCurrentValue = todayActivity.sleepDuration;
        isCompleted = updatedCurrentValue >= goal.targetValue;
      } else if (goal.type === 'Workouts') {
        // Count workouts logged since the goal was created
        const workoutCount = await Workout.countDocuments({
          userId,
          date: { $gte: goal.createdAt }
        });
        updatedCurrentValue = workoutCount;
        isCompleted = updatedCurrentValue >= goal.targetValue;
      } else if (goal.type === 'Weight' && user) {
        updatedCurrentValue = user.weight;
        // For weight, we might want to lose or gain.
        // Let's assume completion is when they reach it (either below for loss, or above for gain, or simply equal/close)
        const startingWeight = user.weightHistory[0] ? user.weightHistory[0].weight : user.weight;
        if (startingWeight >= goal.targetValue) {
          isCompleted = user.weight <= goal.targetValue; // Loss goal
        } else {
          isCompleted = user.weight >= goal.targetValue; // Gain goal
        }
      }

      // Check if deadline has passed
      const now = new Date();
      let status = goal.status;
      if (isCompleted) {
        status = 'Completed';
        
        // Send Notification
        await Notification.create({
          userId,
          title: `🎉 Goal Completed: ${goal.type}!`,
          message: `Congratulations! You reached your goal of ${goal.targetValue} ${goal.type === 'Workouts' ? 'workouts' : goal.type === 'Weight' ? 'kg' : goal.type === 'Water' ? 'ml' : goal.type === 'Sleep' ? 'hours' : 'steps'}!`,
          type: 'GoalAlert'
        });
      } else if (now > goal.deadline) {
        status = 'Failed';
      }

      goal.currentValue = updatedCurrentValue;
      goal.status = status;
      await goal.save();
    }

    // Check achievements again if any goals completed
    if (user) {
      await checkAndAwardAchievements(user);
    }
  } catch (error) {
    console.error(`Error syncing goal progress: ${error.message}`);
  }
};

// @desc    Get all goals for logged-in user (syncs progress first)
// @route   GET /api/goals
// @access  Private
const getGoals = async (req, res, next) => {
  try {
    // Sync progress automatically before retrieving
    await syncGoalProgress(req.user._id);

    const { status } = req.query;
    let query = { userId: req.user._id };

    if (status) {
      query.status = status;
    }

    const goals = await Goal.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: goals.length,
      data: goals
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a goal
// @route   POST /api/goals
// @access  Private
const createGoal = async (req, res, next) => {
  try {
    const { type, targetValue, deadline } = req.body;

    if (!type || !targetValue || !deadline) {
      res.status(400);
      throw new Error('Please provide goal type, target value, and deadline date');
    }

    // Initialize current value
    let currentValue = 0;
    if (type === 'Weight') {
      currentValue = req.user.weight || 0;
    }

    const goal = await Goal.create({
      userId: req.user._id,
      type,
      targetValue: Number(targetValue),
      currentValue,
      deadline: new Date(deadline),
      status: 'Active'
    });

    res.status(201).json({
      success: true,
      data: goal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a goal (Manual update)
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = async (req, res, next) => {
  try {
    let goal = await Goal.findById(req.params.id);

    if (!goal) {
      res.status(404);
      throw new Error('Goal not found');
    }

    if (goal.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to update this goal');
    }

    goal = await Goal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: goal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a goal
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      res.status(404);
      throw new Error('Goal not found');
    }

    if (goal.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to delete this goal');
    }

    await goal.deleteOne();

    res.json({
      success: true,
      message: 'Goal deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal
};
