const express = require('express');
const { getStats, getUsers, getPendingKyc, verifyPrestataire, updateUserStatus, getAllRequests } = require('../controllers/adminController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate, authorize(['ADMIN']));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.get('/kyc/pending', getPendingKyc);
router.patch('/users/:id/verify', verifyPrestataire);
router.patch('/users/:id/status', updateUserStatus);
router.get('/requests', getAllRequests);

module.exports = router;
