const express = require('express');
const {
  getStats, getUsers, getPendingKyc, verifyPrestataire, updateUserStatus, getAllRequests,
  getKycDetail, adminRegisterUser, adminGetCategories, adminCreateCategory, adminUpdateCategory,
  adminDeleteCategory, getFeaturedServices, toggleFeaturedService, getPaymentConfig, upsertPaymentConfig,
} = require('../controllers/adminController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate, authorize(['ADMIN']));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.get('/kyc/pending', getPendingKyc);
router.get('/kyc/:id', getKycDetail);
router.patch('/users/:id/verify', verifyPrestataire);
router.patch('/users/:id/status', updateUserStatus);
router.post('/users/register', adminRegisterUser);
router.get('/requests', getAllRequests);
router.get('/categories', adminGetCategories);
router.post('/categories', adminCreateCategory);
router.put('/categories/:id', adminUpdateCategory);
router.delete('/categories/:id', adminDeleteCategory);
router.get('/services/featured', getFeaturedServices);
router.patch('/services/:id/featured', toggleFeaturedService);
router.get('/payment-config', getPaymentConfig);
router.put('/payment-config/:provider', upsertPaymentConfig);

module.exports = router;
