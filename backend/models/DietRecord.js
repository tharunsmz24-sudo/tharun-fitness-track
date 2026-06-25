const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  calories: { type: Number, required: true },
  protein: { type: Number, default: 0 }, // in grams
  carbs: { type: Number, default: 0 },   // in grams
  fat: { type: Number, default: 0 }      // in grams
});

const dietRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mealType: {
    type: String,
    required: [true, 'Please specify the meal type'],
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Snacks']
  },
  foodItems: [foodItemSchema],
  totalCalories: {
    type: Number,
    default: 0
  },
  totalProtein: {
    type: Number,
    default: 0
  },
  totalCarbs: {
    type: Number,
    default: 0
  },
  totalFat: {
    type: Number,
    default: 0
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calculate totals before saving
dietRecordSchema.pre('save', function(next) {
  if (this.foodItems && this.foodItems.length > 0) {
    this.totalCalories = this.foodItems.reduce((acc, item) => acc + item.calories, 0);
    this.totalProtein = this.foodItems.reduce((acc, item) => acc + (item.protein || 0), 0);
    this.totalCarbs = this.foodItems.reduce((acc, item) => acc + (item.carbs || 0), 0);
    this.totalFat = this.foodItems.reduce((acc, item) => acc + (item.fat || 0), 0);
  }
  next();
});

const mongooseModel = mongoose.model('DietRecord', dietRecordSchema);
const { getMockModel } = require('../utils/mockDb');
const mockModel = getMockModel('DietRecord');

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
