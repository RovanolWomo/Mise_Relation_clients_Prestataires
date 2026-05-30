const express = require('express');
const { createService, getServices, getServiceById, updateService, deleteService, getCategories, getMyServices } = require('../controllers/serviceController');
const { authenticate, authorize } = require('../middlewares/auth');
const { upload } = require('../utils/cloudinary');

const router = express.Router();

router.get('/categories', getCategories);
router.get('/my', authenticate, getMyServices);
router.get('/', getServices);
router.get('/:id', getServiceById);

router.post('/', authenticate, authorize(['PRESTATAIRE']), upload.single('image'), createService);
router.put('/:id', authenticate, authorize(['PRESTATAIRE']), upload.single('image'), updateService);
router.delete('/:id', authenticate, authorize(['PRESTATAIRE', 'ADMIN']), deleteService);

module.exports = router;
