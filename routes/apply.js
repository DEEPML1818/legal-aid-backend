// legal-aid-backend/routes/apply.js

const express = require('express');
const router = express.Router();

// POST route for application submission
router.post('/apply', (req, res) => {
    const { salary } = req.body; // Extract salary from request body

    // Validate input
    if (salary === undefined || isNaN(salary)) {
        return res.status(400).json({ message: 'Invalid salary input.' });
    }

    // AI Logic to verify salary
    if (salary < 50000) {
        // Proceed with the application processing (e.g., save to database)
        res.status(200).json({ message: 'Application submitted successfully!' });
    } else {
        // Salary exceeds the limit for legal aid
        res.status(400).json({ message: 'Salary exceeds the limit for legal aid.' });
    }
});

module.exports = router; // Export the router
