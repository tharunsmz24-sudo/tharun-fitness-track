const express = require('express');
const router = express.Router();
const {
  getDietRecords,
  getDietRecordById,
  createDietRecord,
  updateDietRecord,
  deleteDietRecord
} = require('../controllers/dietController');
const { protect } = require('../middleware/authMiddleware');

// All diet routes require authentication
router.use(protect);

router.route('/')
  .get(getDietRecords)
  .post(createDietRecord);

router.route('/:id')
  .get(getDietRecordById)
  .put(updateDietRecord)
  .delete(deleteDietRecord);

module.exports = router;
