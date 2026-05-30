const express = require('express');
const {
  getStats, getUsers, getPendingKyc, verifyPrestataire, updateUserStatus, getAllRequests,
  getKycDetail, adminRegisterUser, adminGetCategories, adminCreateCategory, adminUpdateCategory,
  adminDeleteCategory, adminGetServices, adminCreateService, adminUpdateService, adminDeleteService,
  getFeaturedServices, toggleFeaturedService, getPaymentConfig, upsertPaymentConfig,
} = require('../controllers/adminController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate, authorize(['ADMIN']));

// Stats
router.get('/stats', getStats);

// Users
router.get('/users', getUsers);
router.post('/users/register', adminRegisterUser);
router.patch('/users/:id/verify', verifyPrestataire);
router.patch('/users/:id/status', updateUserStatus);

// KYC
router.get('/kyc/pending', getPendingKyc);
router.get('/kyc/:id', getKycDetail);

// Requests
router.get('/requests', getAllRequests);

// Categories
router.get('/categories', adminGetCategories);
router.post('/categories', adminCreateCategory);
router.put('/categories/:id', adminUpdateCategory);
router.delete('/categories/:id', adminDeleteCategory);

// Services — IMPORTANT: routes statiques avant :id
router.get('/services/featured', getFeaturedServices);
router.get('/services', adminGetServices);
router.post('/services', adminCreateService);
router.put('/services/:id', adminUpdateService);
router.delete('/services/:id', adminDeleteService);
router.patch('/services/:id/featured', toggleFeaturedService);

// Payment config
router.get('/payment-config', getPaymentConfig);
router.put('/payment-config/:provider', upsertPaymentConfig);

module.exports = router;
