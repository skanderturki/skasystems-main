const express = require('express');
const statsController = require('../controllers/stats.controller');
const { protect, requireVerified } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/overview', protect, requireVerified, statsController.getOverview);

module.exports = router;
