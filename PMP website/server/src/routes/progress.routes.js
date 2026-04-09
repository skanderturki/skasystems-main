const express = require('express');
const progressController = require('../controllers/progress.controller');
const { protect, requireVerified } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/dashboard', protect, requireVerified, progressController.getDashboard);

module.exports = router;
