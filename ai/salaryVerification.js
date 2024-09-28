// legal-aid-backend/ai/salaryVerification.js

const verifySalary = (salary) => {
    if (salary < 50000) {
        return true; // Eligible for verification
    }
    return false; // Not eligible
};

module.exports = verifySalary;