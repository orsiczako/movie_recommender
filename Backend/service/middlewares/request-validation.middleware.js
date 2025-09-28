/**
 * Request validation middleware
 */

const ApiResponse = require('../helpers/api-response.helper');

/**
 * Validate required fields in request body
 */
const validateRequired = (...fields) => {
  return (req, res, next) => {
    const missing = fields.filter(field => !req.body[field]);
    
    if (missing.length > 0) {
      console.log(`[VALIDATION] Missing fields: ${missing.join(', ')}`);
      return ApiResponse.validationError(res);
    }
    
    next();
  };
};

/**
 * Validate email template structure
 */
const validateEmailTemplate = (req, res, next) => {
  const { emailTemplate } = req.body;
  
  if (!emailTemplate || !emailTemplate.subject || !emailTemplate.html) {
    console.log('[VALIDATION] Invalid email template');
    return ApiResponse.validationError(res, 'Email template is required');
  }
  
  next();
};

module.exports = {
  validateRequired,
  validateEmailTemplate
};