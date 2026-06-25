const User = require('../models/User');
const Workout = require('../models/Workout');
const DietRecord = require('../models/DietRecord');
const Activity = require('../models/Activity');
const Goal = require('../models/Goal');
const Notification = require('../models/Notification');

// Helper: Calculate BMI category
const getBMICategory = (weight, height) => {
  if (!weight || !height) return 'Unknown';
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

// @desc    Get system-wide analytics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalWorkouts = await Workout.countDocuments();
    const totalDiets = await DietRecord.countDocuments();
    
    // Average metrics aggregations
    const activityStats = await Activity.aggregate([
      {
        $group: {
          _id: null,
          avgSteps: { $avg: '$steps' },
          avgActiveMinutes: { $avg: '$activeMinutes' },
          avgWaterIntake: { $avg: '$waterIntake' },
          totalSteps: { $sum: '$steps' }
        }
      }
    ]);

    const stats = activityStats[0] || {
      avgSteps: 0,
      avgActiveMinutes: 0,
      avgWaterIntake: 0,
      totalSteps: 0
    };

    // BMI breakdowns across users
    const allUsers = await User.find({});
    const bmiBreakdown = {
      Underweight: 0,
      Normal: 0,
      Overweight: 0,
      Obese: 0,
      Unknown: 0
    };

    allUsers.forEach(user => {
      const category = getBMICategory(user.weight, user.height);
      bmiBreakdown[category]++;
    });

    // Workout category statistics
    const workoutStats = await Workout.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgDuration: { $avg: '$duration' },
          totalCalories: { $sum: '$caloriesBurned' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalWorkouts,
        totalDiets,
        avgSteps: Math.round(stats.avgSteps || 0),
        avgActiveMinutes: Math.round(stats.avgActiveMinutes || 0),
        avgWaterIntake: Math.round(stats.avgWaterIntake || 0),
        totalSteps: stats.totalSteps || 0,
        bmiBreakdown,
        workoutStats
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const users = await User.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Prevent admin from removing their own admin role
    if (user._id.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('You cannot modify your own administrator role');
    }

    user.role = req.body.role || (user.role === 'admin' ? 'user' : 'admin');
    await user.save();

    res.json({
      success: true,
      message: `User role updated successfully to ${user.role}`,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user and all their records (GDPR compliance)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Prevent deleting self
    if (user._id.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('You cannot delete your own administrator account');
    }

    const userId = user._id;

    // Delete all related records in parallel
    await Promise.all([
      Workout.deleteMany({ userId }),
      DietRecord.deleteMany({ userId }),
      Activity.deleteMany({ userId }),
      Goal.deleteMany({ userId }),
      Notification.deleteMany({ userId }),
      user.deleteOne()
    ]);

    res.json({
      success: true,
      message: 'User and all associated tracking history deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getAllUsers,
  updateUserRole,
  deleteUser
};
