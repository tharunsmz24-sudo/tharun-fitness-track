const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

// All notification routes require authentication
router.use(protect);

router.get('/', getNotifications);
router.put('/readall', markAllAsRead);
router.put('/:id', markAsRead);
router.delete('/clearall', clearAllNotifications);
router.delete('/:id', deleteNotification);

module.exports = router;
