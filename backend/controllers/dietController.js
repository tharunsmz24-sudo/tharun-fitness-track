const DietRecord = require('../models/DietRecord');

// @desc    Get all diet records for logged-in user
// @route   GET /api/diet
// @access  Private
const getDietRecords = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    let query = { userId: req.user._id };

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

    const records = await DietRecord.find(query).sort({ date: -1 });

    res.json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single diet record
// @route   GET /api/diet/:id
// @access  Private
const getDietRecordById = async (req, res, next) => {
  try {
    const record = await DietRecord.findById(req.params.id);

    if (!record) {
      res.status(404);
      throw new Error('Diet record not found');
    }

    // Ensure record belongs to user
    if (record.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to view this record');
    }

    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a diet record
// @route   POST /api/diet
// @access  Private
const createDietRecord = async (req, res, next) => {
  try {
    const { mealType, foodItems, date } = req.body;

    if (!mealType || !foodItems || foodItems.length === 0) {
      res.status(400);
      throw new Error('Please provide meal type and at least one food item');
    }

    const record = new DietRecord({
      userId: req.user._id,
      mealType,
      foodItems,
      date: date ? new Date(date) : new Date()
    });

    // Save will trigger the pre-save hook to calculate totals
    await record.save();

    res.status(201).json({
      success: true,
      data: record
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a diet record
// @route   PUT /api/diet/:id
// @access  Private
const updateDietRecord = async (req, res, next) => {
  try {
    let record = await DietRecord.findById(req.params.id);

    if (!record) {
      res.status(404);
      throw new Error('Diet record not found');
    }

    // Ensure record belongs to user
    if (record.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to update this record');
    }

    // Re-assign fields
    if (req.body.mealType) record.mealType = req.body.mealType;
    if (req.body.foodItems) record.foodItems = req.body.foodItems;
    if (req.body.date) record.date = new Date(req.body.date);

    // Save will trigger the pre-save hook to recalculate totals
    const updatedRecord = await record.save();

    res.json({
      success: true,
      data: updatedRecord
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a diet record
// @route   DELETE /api/diet/:id
// @access  Private
const deleteDietRecord = async (req, res, next) => {
  try {
    const record = await DietRecord.findById(req.params.id);

    if (!record) {
      res.status(404);
      throw new Error('Diet record not found');
    }

    // Ensure record belongs to user
    if (record.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to delete this record');
    }

    await record.deleteOne();

    res.json({
      success: true,
      message: 'Diet record removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDietRecords,
  getDietRecordById,
  createDietRecord,
  updateDietRecord,
  deleteDietRecord
};
