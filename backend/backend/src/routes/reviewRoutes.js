const express = require('express');
const { createReview, getReviewsByPrestataire } = require('../controllers/reviewController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

router.post('/', authenticate, authorize(['PARTICULIER']), createReview);
router.get('/prestataire/:id', getReviewsByPrestataire);

module.exports = router;
