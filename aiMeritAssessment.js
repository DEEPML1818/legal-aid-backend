// aiMeritAssessment.js

function assessMerit(ocrText) {
    // List of keywords to check for merit assessment
    const meritKeywords = ['low income', 'disability', 'debt', 'unemployment'];
  
    // Convert the text to lowercase to handle case insensitivity
    const lowerCaseText = ocrText.toLowerCase();
  
    // Check for the presence of any merit keywords
    const hasMerit = meritKeywords.some(keyword => lowerCaseText.includes(keyword));
  
    if (hasMerit) {
      return { hasMerit: true, reason: 'Case contains relevant merit-related keywords.' };
    } else {
      return { hasMerit: false, reason: 'No merit-related keywords found in the document.' };
    }
  }
  
  module.exports = { assessMerit };
  