const express = require('express');
const practiceController = require('../controllers/practice.controller');
const { protect, requireVerified } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/available', protect, requireVerified, practiceController.getAvailable);
router.post('/start', protect, requireVerified, practiceController.start);
router.post('/submit', protect, requireVerified, practiceController.submit);
router.get('/history', protect, requireVerified, practiceController.getHistory);
router.get('/:attemptId', protect, requireVerified, practiceController.getAttempt);

module.exports = router;
