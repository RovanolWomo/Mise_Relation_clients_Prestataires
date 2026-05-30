const express = require('express');
const { getNotifications, markRead, markAllRead, deleteNotification } = require('../controllers/notificationController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticate, getNotifications);
router.patch('/:id/read', authenticate, markRead);
router.patch('/read-all', authenticate, markAllRead);
router.delete('/:id', authenticate, deleteNotification);

module.exports = router;
