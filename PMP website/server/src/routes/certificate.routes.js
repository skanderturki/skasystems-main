const express = require('express');
const certificateController = require('../controllers/certificate.controller');
const { protect, requireVerified } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', protect, requireVerified, certificateController.getCertificates);
router.get('/:id/download', protect, requireVerified, certificateController.downloadCertificate);

module.exports = router;
