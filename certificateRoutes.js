const express = require('express');
const PDFDocument = require('pdfkit');
const { applications } = require('./storage');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Route to generate a certificate
router.get('/generate/:id', (req, res) => {
  const applicationId = parseInt(req.params.id);
  const application = applications.find(app => app.id === applicationId);

  if (!application) {
    return res.status(404).json({ message: 'Application not found' });
  }

  if (application.status !== 'Approved') {
    return res.status(400).json({ message: 'Application not yet approved' });
  }

  // Create a PDF document
  const doc = new PDFDocument();
  const filePath = path.join(__dirname, 'certificates', `certificate_${applicationId}.pdf`);

  // Pipe the PDF into a file
  doc.pipe(fs.createWriteStream(filePath));

  // Add certificate content
  doc.fontSize(20).text('Legal Aid Certificate', { align: 'center' });
  doc.moveDown();
  doc.fontSize(16).text(`Application ID: ${application.id}`);
  doc.text(`Applicant Income: ${application.income}`);
  doc.text(`Employment Status: ${application.employmentStatus}`);
  doc.text(`Education Level: ${application.educationLevel}`);
  doc.text(`Status: ${application.status}`);
  doc.text('This certificate is proof of eligibility for legal aid assistance.');

  // Finalize the PDF and close the document
  doc.end();

  // Send the PDF file as a response
  doc.on('finish', () => {
    res.download(filePath);
  });
});

module.exports = router;
