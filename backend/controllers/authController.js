const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { checkAndAwardAchievements } = require('../utils/achievements');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fittrack_pro_super_secret_jwt_key_2026', {
    expiresIn: '30d'
  });
};

// Helper: Calculate BMI
const calculateBMI = (weight, height) => {
  if (!weight || !height) return 0;
  const heightInMeters = height / 100;
  return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, height, weight, targetWeight, role } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please enter all required fields (name, email, password)');
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists with this email');
    }

    // Set initial weight history if weight is provided
    const weightHistory = weight ? [{ weight, date: new Date() }] : [];

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      height: height || 0,
      weight: weight || 0,
      targetWeight: targetWeight || 0,
      weightHistory,
      role: role || 'user' // Allow specifying role (useful for setting up admin)
    });

    if (user) {
      res.status(201).json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        height: user.height,
        weight: user.weight,
        targetWeight: user.targetWeight,
        bmi: calculateBMI(user.weight, user.height),
        token: generateToken(user._id)
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Please enter both email and password');
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        height: user.height,
        weight: user.weight,
        targetWeight: user.targetWeight,
        bmi: calculateBMI(user.weight, user.height),
        profilePicture: user.profilePicture,
        token: generateToken(user._id)
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        height: user.height,
        weight: user.weight,
        targetWeight: user.targetWeight,
        targetCalories: user.targetCalories,
        targetWater: user.targetWater,
        targetSteps: user.targetSteps,
        bmi: calculateBMI(user.weight, user.height),
        profilePicture: user.profilePicture,
        weightHistory: user.weightHistory,
        achievements: user.achievements,
        createdAt: user.createdAt
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.height = req.body.height !== undefined ? req.body.height : user.height;
      user.targetWeight = req.body.targetWeight !== undefined ? req.body.targetWeight : user.targetWeight;
      user.targetCalories = req.body.targetCalories !== undefined ? req.body.targetCalories : user.targetCalories;
      user.targetWater = req.body.targetWater !== undefined ? req.body.targetWater : user.targetWater;
      user.targetSteps = req.body.targetSteps !== undefined ? req.body.targetSteps : user.targetSteps;
      
      if (req.body.profilePicture !== undefined) {
        user.profilePicture = req.body.profilePicture;
      }

      // If weight changes, log in weight history
      if (req.body.weight !== undefined && req.body.weight !== user.weight) {
        user.weight = req.body.weight;
        user.weightHistory.push({
          weight: user.weight,
          date: new Date()
        });
      }

      // If updating password
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      // Check if new weight unlocks any achievements (like GOAL_CRUSHER)
      await checkAndAwardAchievements(updatedUser);

      res.json({
        success: true,
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        height: updatedUser.height,
        weight: updatedUser.weight,
        targetWeight: updatedUser.targetWeight,
        targetCalories: updatedUser.targetCalories,
        targetWater: updatedUser.targetWater,
        targetSteps: updatedUser.targetSteps,
        bmi: calculateBMI(updatedUser.weight, updatedUser.height),
        profilePicture: updatedUser.profilePicture,
        weightHistory: updatedUser.weightHistory,
        achievements: updatedUser.achievements,
        token: generateToken(updatedUser._id)
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password (Mock)
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      res.status(400);
      throw new Error('Please provide an email address');
    }

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404);
      throw new Error('There is no user with that email');
    }

    // In a real application, you would generate a token and email it.
    // For demo purposes, we will return a success message along with the reset code.
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fittrack_pro_super_secret_jwt_key_2026', {
      expiresIn: '10m' // Reset link valid for 10 mins
    });

    res.json({
      success: true,
      message: 'Password reset link generated successfully.',
      resetLink: `/reset-password/${resetToken}`,
      instruction: 'In development mode, you can copy this link and navigate to it to complete the reset.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  forgotPassword
};
