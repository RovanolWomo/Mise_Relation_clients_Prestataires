const express = require('express');
const { getPrestataires, getPrestataire } = require('../controllers/userController');

const router = express.Router();

router.get('/prestataires', getPrestataires);
router.get('/prestataires/:id', getPrestataire);

module.exports = router;
