const express = require('express');
const { applications } = require('./storage');
const router = express.Router();

router.post('/apply', (req, res) => {
  const { userId, income, employmentStatus, educationLevel } = req.body;

  const newApplication = {
    id: applications.length + 1,
    userId,
    income,
    employmentStatus,
    educationLevel,
    status: 'Pending'
  };

  applications.push(newApplication);
  res.status(201).json({ message: 'Application submitted', application: newApplication });
});

router.get('/applications', (req, res) => {
  res.status(200).json({ applications });
});

module.exports = router;
