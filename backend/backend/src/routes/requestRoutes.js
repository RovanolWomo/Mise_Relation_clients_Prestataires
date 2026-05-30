const express = require('express');
const {
  createRequest, getCustomerRequests, getProviderRequests,
  getAvailableRequests, getRequestById, acceptRequest, updateRequestStatus, assignRequest,
} = require('../controllers/requestController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

router.post('/', authenticate, authorize(['PARTICULIER']), createRequest);
router.get('/my', authenticate, getCustomerRequests);
router.get('/provider', authenticate, authorize(['PRESTATAIRE']), getProviderRequests);
router.get('/available', authenticate, authorize(['PRESTATAIRE']), getAvailableRequests);
router.get('/:id', authenticate, getRequestById);
router.patch('/:id/assign', authenticate, authorize(['PARTICULIER']), assignRequest);
router.patch('/:id/accept', authenticate, authorize(['PRESTATAIRE']), acceptRequest);
router.patch('/:id/status', authenticate, updateRequestStatus);

module.exports = router;
