const Certificate = require('../models/Certificate');

exports.verifyCertificate = async (req, res, next) => {
  try {
    const certificate = await Certificate.findOne({
      verificationToken: req.params.token,
    });

    if (!certificate || certificate.isRevoked) {
      return res.json({ valid: false });
    }

    res.json({
      valid: true,
      recipientName: certificate.recipientName,
      examTitle: certificate.examTitle,
      score: certificate.score,
      issuedAt: certificate.issuedAt,
      certificateNumber: certificate.certificateNumber,
    });
  } catch (error) {
    next(error);
  }
};
