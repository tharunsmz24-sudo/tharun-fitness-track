const express = require('express');
const router = express.Router();
const {
  getActivities,
  getTodayActivity,
  updateActivity,
  incrementWater,
  incrementSteps
} = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');

// All activity routes require authentication
router.use(protect);

router.get('/', getActivities);
router.route('/today')
  .get(getTodayActivity)
  .put(updateActivity);

router.patch('/water', incrementWater);
router.patch('/steps', incrementSteps);

module.exports = router;
