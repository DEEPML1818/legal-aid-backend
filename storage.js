const fs = require('fs');

// Load existing data from JSON files (if available)
const users = JSON.parse(fs.readFileSync('./data/users.json', 'utf8') || '[]');
const applications = JSON.parse(fs.readFileSync('./data/applications.json', 'utf8') || '[]');
const ocrLogs = JSON.parse(fs.readFileSync('./data/ocrLogs.json', 'utf8') || '[]');

// Helper function to save data back to files
const saveData = () => {
  fs.writeFileSync('./data/users.json', JSON.stringify(users, null, 2));
  fs.writeFileSync('./data/applications.json', JSON.stringify(applications, null, 2));
  fs.writeFileSync('./data/ocrLogs.json', JSON.stringify(ocrLogs, null, 2));
};

module.exports = {
  users,
  applications,
  ocrLogs,
  saveData
};
