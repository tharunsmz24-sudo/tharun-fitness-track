const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const weightHistorySchema = new mongoose.Schema({
  weight: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

const achievementSchema = new mongoose.Schema({
  badgeId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  unlockedAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  profilePicture: {
    type: String, // Base64 string
    default: ''
  },
  height: {
    type: Number,
    default: 0 // in cm
  },
  weight: {
    type: Number,
    default: 0 // in kg
  },
  targetWeight: {
    type: Number,
    default: 0
  },
  targetCalories: {
    type: Number,
    default: 2000
  },
  targetWater: {
    type: Number,
    default: 2500 // in ml
  },
  targetSteps: {
    type: Number,
    default: 10000
  },
  weightHistory: [weightHistorySchema],
  achievements: [achievementSchema]
}, {
  timestamps: true
});

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const mongooseModel = mongoose.model('User', userSchema);
const { getMockModel } = require('../utils/mockDb');
const mockModel = getMockModel('User');

const delegateModel = new Proxy({}, {
  get: (target, prop) => {
    if (global.useMockDb) {
      return mockModel[prop];
    }
    return mongooseModel[prop];
  },
  construct: (target, args) => {
    if (global.useMockDb) {
      return new mockModel(...args);
    }
    return new mongooseModel(...args);
  }
});

module.exports = delegateModel;
