const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Please select a workout category'],
    enum: ['Running', 'Walking', 'Cycling', 'Gym', 'Yoga', 'Swimming', 'Other']
  },
  duration: {
    type: Number,
    required: [true, 'Please add workout duration in minutes'],
    min: [1, 'Duration must be at least 1 minute']
  },
  caloriesBurned: {
    type: Number,
    required: [true, 'Please add calories burned'],
    min: [0, 'Calories burned cannot be negative']
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const mongooseModel = mongoose.model('Workout', workoutSchema);
const { getMockModel } = require('../utils/mockDb');
const mockModel = getMockModel('Workout');

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
