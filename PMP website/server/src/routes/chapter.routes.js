const express = require('express');
const chapterController = require('../controllers/chapter.controller');
const { protect, requireVerified } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', protect, requireVerified, chapterController.getChapters);
router.get('/:id', protect, requireVerified, chapterController.getChapter);

module.exports = router;
