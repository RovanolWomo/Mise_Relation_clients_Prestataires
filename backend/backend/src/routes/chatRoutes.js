const express = require('express');
const { getOrCreateConversation, getConversations, getMessages } = require('../controllers/chatController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', getConversations);
router.post('/start', getOrCreateConversation);
router.get('/:id/messages', getMessages);

module.exports = router;
