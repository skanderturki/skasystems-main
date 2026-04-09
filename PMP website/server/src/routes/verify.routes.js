const express = require('express');
const verifyController = require('../controllers/verify.controller');
const { verifyLimiter } = require('../middleware/rateLimiter.middleware');

const router = express.Router();

router.get('/:token', verifyLimiter, verifyController.verifyCertificate);

module.exports = router;
