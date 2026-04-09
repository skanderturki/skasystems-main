const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const { CLIENT_URL } = require('../config/env');

async function generateCertificatePDF(certificate) {
  const verifyUrl = `${CLIENT_URL}/verify/${certificate.verificationToken}`;
  const qrBuffer = await QRCode.toBuffer(verifyUrl, {
    width: 120,
    margin: 1,
    color: { dark: '#1e1b4b', light: '#ffffff' },
  });

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margins: { top: 40, bottom: 40, left: 60, right: 60 },
    });

    const buffers = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    // Border
    doc.lineWidth(3)
      .rect(30, 30, pageWidth - 60, pageHeight - 60)
      .stroke('#4f46e5');

    doc.lineWidth(1)
      .rect(35, 35, pageWidth - 70, pageHeight - 70)
      .stroke('#c7d2fe');

    // Header
    doc.fontSize(14)
      .fillColor('#6366f1')
      .text('PMP LEARN', 0, 60, { align: 'center' });

    // Title
    doc.fontSize(36)
      .fillColor('#1e1b4b')
      .text('Certificate of Completion', 0, 100, { align: 'center' });

    // Decorative line
    const centerX = pageWidth / 2;
    doc.moveTo(centerX - 100, 150)
      .lineTo(centerX + 100, 150)
      .lineWidth(2)
      .stroke('#4f46e5');

    // Body text
    doc.fontSize(14)
      .fillColor('#374151')
      .text('This is to certify that', 0, 175, { align: 'center' });

    doc.fontSize(28)
      .fillColor('#1e1b4b')
      .text(certificate.recipientName, 0, 205, { align: 'center' });

    doc.fontSize(14)
      .fillColor('#374151')
      .text('has successfully completed', 0, 250, { align: 'center' });

    doc.fontSize(20)
      .fillColor('#4f46e5')
      .text(certificate.examTitle, 0, 275, { align: 'center' });

    doc.fontSize(14)
      .fillColor('#374151')
      .text(`with a score of ${certificate.score}%`, 0, 310, { align: 'center' });

    // Certificate details
    doc.fontSize(11)
      .fillColor('#6b7280')
      .text(`Certificate #: ${certificate.certificateNumber}`, 0, 350, { align: 'center' });

    doc.text(
      `Date: ${new Date(certificate.issuedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}`,
      0,
      368,
      { align: 'center' }
    );

    // QR Code
    doc.image(qrBuffer, pageWidth - 200, pageHeight - 180, { width: 100 });
    doc.fontSize(8)
      .fillColor('#9ca3af')
      .text('Scan to verify', pageWidth - 200, pageHeight - 70, { width: 100, align: 'center' });

    // Signature line
    doc.moveTo(80, pageHeight - 100)
      .lineTo(280, pageHeight - 100)
      .lineWidth(1)
      .stroke('#d1d5db');

    doc.fontSize(10)
      .fillColor('#6b7280')
      .text('Authorized Signature', 80, pageHeight - 90, { width: 200, align: 'center' });

    doc.end();
  });
}

module.exports = { generateCertificatePDF };
