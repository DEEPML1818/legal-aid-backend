// legal-aid-backend/routes/applicationRoutes.js

const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const verifySalary = require('../ai/salaryVerification');

router.post('/apply', async (req, res) => {
    try {
        const { salary } = req.body;

        // Verify salary
        const isEligible = verifySalary(salary);

        if (!isEligible) {
            return res.status(400).json({ message: 'Salary exceeds the limit for assistance.' });
        }

        // Proceed with application processing
        const newApplication = new Application(req.body);
        await newApplication.save();
        res.status(201).json({ message: 'Application submitted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error processing application.' });
    }
});

module.exports = router;
