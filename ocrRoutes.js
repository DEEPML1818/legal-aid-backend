const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const { ocrLogs, applications, saveData } = require('./storage');
const path = require('path');
const { assessMerit } = require('./aiMeritAssessment');


const router = express.Router();

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

// Modify the OCR route to include merit assessment
router.post('/upload/:id', upload.single('document'), (req, res) => {
  const applicationId = parseInt(req.params.id);
  const application = applications.find(app => app.id === applicationId);

  if (!application) {
    return res.status(404).json({ message: 'Application not found' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const filePath = path.join(__dirname, req.file.path);

  Tesseract.recognize(filePath, 'eng')
    .then(({ data: { text } }) => {
      // Log OCR result and save it
      const ocrLog = {
        applicationId: applicationId,
        documentPath: req.file.path,
        extractedText: text
      };

      ocrLogs.push(ocrLog);
      saveData();

      // Perform merit assessment based on OCR text
      const meritAssessment = assessMerit(text);

      res.status(200).json({
        message: 'Document processed',
        ocrText: text,
        meritAssessment: meritAssessment
      });
    })
    .catch(err => {
      res.status(500).json({ message: 'OCR error', error: err.message });
    });
});

router.get('/ocrLogs', (req, res) => {
  res.status(200).json({ ocrLogs });
});

module.exports = router;
