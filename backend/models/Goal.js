const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: [true, 'Please specify the goal type'],
    enum: ['Steps', 'Weight', 'Workouts', 'CaloriesBurned', 'Water', 'Sleep']
  },
  targetValue: {
    type: Number,
    required: [true, 'Please specify the target value']
  },
  currentValue: {
    type: Number,
    default: 0
  },
  deadline: {
    type: Date,
    required: [true, 'Please specify the target date']
  },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Failed'],
    default: 'Active'
  }
}, {
  timestamps: true
});

const mongooseModel = mongoose.model('Goal', goalSchema);
const { getMockModel } = require('../utils/mockDb');
const mockModel = getMockModel('Goal');

const delegateModel = new Proxy({}, {
  get: (target, prop) => {
    if (global.useMockDb) return mockModel[prop];
    return mongooseModel[prop];
  },
  construct: (target, args) => {
    if (global.useMockDb) return new mockModel(...args);
    return new mongooseModel(...args);
  }
});

module.exports = delegateModel;
