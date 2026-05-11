const express = require('express');
const adminController = require('../controllers/admin.controller');
const { protect, requireVerified, adminOnly } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect, requireVerified, adminOnly);

router.get('/certificates', adminController.listCertificates);
router.get('/certificates.csv', adminController.exportCertificatesCsv);
router.patch('/certificates/:id/revoke', adminController.revokeCertificate);
router.patch('/certificates/:id/reactivate', adminController.reactivateCertificate);

router.get('/exam-attempts', adminController.listExamAttempts);
router.get('/exam-attempts.csv', adminController.exportExamAttemptsCsv);

router.get('/users', adminController.listUsers);
router.get('/users.csv', adminController.exportUsersCsv);
router.get('/user-ids', adminController.listUserIds);
router.patch('/users/:id/ban', adminController.banUser);
router.patch('/users/:id/unban', adminController.unbanUser);
router.post('/bulk-email', adminController.sendBulkEmail);

module.exports = router;
