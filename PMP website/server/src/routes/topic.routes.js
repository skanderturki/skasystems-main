const express = require('express');
const topicController = require('../controllers/topic.controller');
const { protect, requireVerified } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/:slug', protect, requireVerified, topicController.getTopic);
router.post('/:id/complete', protect, requireVerified, topicController.completeTopic);

module.exports = router;
