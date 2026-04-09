const express = require('express');
const examController = require('../controllers/exam.controller');
const { protect, requireVerified } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/available', protect, requireVerified, examController.getAvailable);
router.post('/start', protect, requireVerified, examController.start);
router.post('/submit', protect, requireVerified, examController.submit);
router.get('/history', protect, requireVerified, examController.getHistory);
router.get('/:attemptId', protect, requireVerified, examController.getAttempt);

module.exports = router;
