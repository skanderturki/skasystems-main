const Certificate = require('../models/Certificate');
const { generateCertificatePDF } = require('../services/certificate.service');

exports.getCertificates = async (req, res, next) => {
  try {
    const certificates = await Certificate.find({
      user: req.user._id,
      isRevoked: false,
    }).sort({ issuedAt: -1 });

    res.json({ certificates });
  } catch (error) {
    next(error);
  }
};

exports.downloadCertificate = async (req, res, next) => {
  try {
    const certificate = await Certificate.findOne({
      _id: req.params.id,
      user: req.user._id,
      isRevoked: false,
    });

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    const pdfBuffer = await generateCertificatePDF(certificate);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=certificate-${certificate.certificateNumber}.pdf`,
      'Content-Length': pdfBuffer.length,
    });
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};
