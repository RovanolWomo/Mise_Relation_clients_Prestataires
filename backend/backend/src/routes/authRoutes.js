const express = require('express');
const { register, login, me, updateProfile, changePassword, registerPrestataire } = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');
const { upload } = require('../utils/cloudinary');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/register-prestataire', upload.fields([
  { name: 'photoProfil', maxCount: 1 },
  { name: 'cniRecto', maxCount: 1 },
  { name: 'cniVerso', maxCount: 1 },
  { name: 'justif', maxCount: 1 },
  { name: 'diplome', maxCount: 1 },
  { name: 'attestation', maxCount: 1 },
]), registerPrestataire);

router.get('/me', authenticate, me);
router.put('/profile', authenticate, upload.single('avatar'), updateProfile);
router.put('/change-password', authenticate, changePassword);

module.exports = router;
