const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  steps: {
    type: Number,
    default: 0,
    min: 0
  },
  distance: {
    type: Number,
    default: 0, // in km
    min: 0
  },
  activeMinutes: {
    type: Number,
    default: 0,
    min: 0
  },
  sleepDuration: {
    type: Number,
    default: 0, // in hours
    min: 0
  },
  waterIntake: {
    type: Number,
    default: 0, // in ml
    min: 0
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to quickly look up user activity for a specific day
activitySchema.index({ userId: 1, date: 1 });

const mongooseModel = mongoose.model('Activity', activitySchema);
const { getMockModel } = require('../utils/mockDb');
const mockModel = getMockModel('Activity');

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
