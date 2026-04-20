const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const { CLIENT_URL } = require('../config/env');

// Signature rendering
const SIGNATURE_FONT_PATH = path.join(__dirname, '..', 'assets', 'signature-font.ttf');
const HAS_SIGNATURE_FONT = fs.existsSync(SIGNATURE_FONT_PATH);
const SIGNER_NAME = 'Skander Turki';
const SIGNER_TITLE_LINE_1 = 'Skander Turki, PhD';
const SIGNER_TITLE_LINE_2 = 'Assistant Professor, Prince Sultan University';

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

    // Signature block: cursive name above the line, title below.
    const sigX = 80;
    const sigWidth = 200;
    const sigLineY = pageHeight - 100;

    if (HAS_SIGNATURE_FONT) {
      doc.font(SIGNATURE_FONT_PATH);
    } else {
      doc.font('Times-Italic');
    }

    doc.fontSize(HAS_SIGNATURE_FONT ? 32 : 26)
      .fillColor('#1e1b4b')
      .text(SIGNER_NAME, sigX, sigLineY - 42, { width: sigWidth, align: 'center' });

    // Back to default font for the line and caption text.
    doc.font('Helvetica');

    doc.moveTo(sigX, sigLineY)
      .lineTo(sigX + sigWidth, sigLineY)
      .lineWidth(1)
      .stroke('#9ca3af');

    doc.fontSize(10)
      .fillColor('#374151')
      .text(SIGNER_TITLE_LINE_1, sigX, sigLineY + 6, { width: sigWidth, align: 'center' });

    doc.fontSize(9)
      .fillColor('#6b7280')
      .text(SIGNER_TITLE_LINE_2, sigX, sigLineY + 20, { width: sigWidth, align: 'center' });

    doc.end();
  });
}

module.exports = { generateCertificatePDF };
