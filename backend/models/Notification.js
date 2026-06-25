const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Reminder', 'GoalAlert', 'System', 'Achievement'],
    default: 'System'
  },
  read: {
    type: Boolean,
    default: false
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const mongooseModel = mongoose.model('Notification', notificationSchema);
const { getMockModel } = require('../utils/mockDb');
const mockModel = getMockModel('Notification');

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
