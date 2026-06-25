const Workout = require('../models/Workout');
const Activity = require('../models/Activity');
const User = require('../models/User');
const { checkAndAwardAchievements } = require('../utils/achievements');

// @desc    Get all workouts for logged-in user
// @route   GET /api/workouts
// @access  Private
const getWorkouts = async (req, res, next) => {
  try {
    const { category, search, startDate, endDate } = req.query;
    
    // Base query: only show workouts for current logged-in user
    let query = { userId: req.user._id };

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by text search in notes
    if (search) {
      query.notes = { $regex: search, $options: 'i' };
    }

    // Filter by date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    const workouts = await Workout.find(query).sort({ date: -1 });
    
    res.json({
      success: true,
      count: workouts.length,
      data: workouts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single workout
// @route   GET /api/workouts/:id
// @access  Private
const getWorkoutById = async (req, res, next) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      res.status(404);
      throw new Error('Workout not found');
    }

    // Ensure workout belongs to logged-in user
    if (workout.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to view this workout');
    }

    res.json({
      success: true,
      data: workout
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a workout
// @route   POST /api/workouts
// @access  Private
const createWorkout = async (req, res, next) => {
  try {
    const { category, duration, caloriesBurned, notes, date } = req.body;

    if (!category || !duration || caloriesBurned === undefined) {
      res.status(400);
      throw new Error('Please provide workout category, duration, and calories burned');
    }

    const workoutDate = date ? new Date(date) : new Date();

    // Create workout
    const workout = await Workout.create({
      userId: req.user._id,
      category,
      duration: Number(duration),
      caloriesBurned: Number(caloriesBurned),
      notes: notes || '',
      date: workoutDate
    });

    // Automatically sync activeMinutes to the user's Daily Activity Record
    const startOfDay = new Date(workoutDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(workoutDate);
    endOfDay.setHours(23, 59, 59, 999);

    let activity = await Activity.findOne({
      userId: req.user._id,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (activity) {
      activity.activeMinutes += Number(duration);
      await activity.save();
    } else {
      await Activity.create({
        userId: req.user._id,
        date: startOfDay,
        activeMinutes: Number(duration),
        steps: 0,
        distance: 0,
        sleepDuration: 0,
        waterIntake: 0
      });
    }

    // Check for achievements
    const user = await User.findById(req.user._id);
    await checkAndAwardAchievements(user);

    res.status(201).json({
      success: true,
      data: workout
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a workout
// @route   PUT /api/workouts/:id
// @access  Private
const updateWorkout = async (req, res, next) => {
  try {
    let workout = await Workout.findById(req.params.id);

    if (!workout) {
      res.status(404);
      throw new Error('Workout not found');
    }

    // Ensure workout belongs to user
    if (workout.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to update this workout');
    }

    const oldDuration = workout.duration;

    // Update workout
    workout = await Workout.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // If duration changed, sync the difference to the Daily Activity Record
    if (req.body.duration !== undefined && Number(req.body.duration) !== oldDuration) {
      const diff = Number(req.body.duration) - oldDuration;
      
      const workoutDate = new Date(workout.date);
      const startOfDay = new Date(workoutDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(workoutDate);
      endOfDay.setHours(23, 59, 59, 999);

      let activity = await Activity.findOne({
        userId: req.user._id,
        date: { $gte: startOfDay, $lte: endOfDay }
      });

      if (activity) {
        activity.activeMinutes = Math.max(0, activity.activeMinutes + diff);
        await activity.save();
      }
    }

    res.json({
      success: true,
      data: workout
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a workout
// @route   DELETE /api/workouts/:id
// @access  Private
const deleteWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      res.status(404);
      throw new Error('Workout not found');
    }

    // Ensure workout belongs to user
    if (workout.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to delete this workout');
    }

    // Subtract duration from Daily Activity before deleting
    const workoutDate = new Date(workout.date);
    const startOfDay = new Date(workoutDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(workoutDate);
    endOfDay.setHours(23, 59, 59, 999);

    let activity = await Activity.findOne({
      userId: req.user._id,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (activity) {
      activity.activeMinutes = Math.max(0, activity.activeMinutes - workout.duration);
      await activity.save();
    }

    await workout.deleteOne();

    res.json({
      success: true,
      message: 'Workout removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWorkouts,
  getWorkoutById,
  createWorkout,
  updateWorkout,
  deleteWorkout
};
