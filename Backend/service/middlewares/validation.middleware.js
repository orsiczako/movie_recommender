/**
 * Validation Middleware - Reusable validation functions
 * 
 * Centralized validation logic to reduce code duplication
 */

const { sendValidationError } = require('./response.helper');
const { detectLocale } = require('./messages.helper');

/**
 * Validate required fields middleware
 * @param {Array} requiredFields - Array of required field names
 * @returns {Function} Express middleware function
 */
function validateRequiredFields(requiredFields) {
  return (req, res, next) => {
    const locale = detectLocale(req.headers);
    const missingFields = [];
    
    for (const field of requiredFields) {
      if (!req.body[field] || req.body[field].toString().trim() === '') {
        missingFields.push(field);
      }
    }
    
    if (missingFields.length > 0) {
      return sendValidationError(res, 'user.errors.missing_fields', locale, missingFields);
    }
    
    next();
  };
}

/**
 * Validate email format
 * @param {string} fieldName - Name of the email field (default: 'email')
 * @returns {Function} Express middleware function
 */
function validateEmail(fieldName = 'email') {
  return (req, res, next) => {
    const locale = detectLocale(req.headers);
    const email = req.body[fieldName];
    
    if (!email) {
      return next(); // Let required field validation handle this
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendValidationError(res, 'user.errors.invalid_email', locale, [fieldName]);
    }
    
    next();
  };
}

/**
 * Validate password strength
 * @param {string} fieldName - Name of the password field (default: 'password')
 * @param {Object} options - Validation options
 * @returns {Function} Express middleware function
 */
function validatePassword(fieldName = 'password', options = {}) {
  const {
    minLength = 6,
    maxLength = 128,
    requireUppercase = false,
    requireLowercase = false,
    requireNumbers = false,
    requireSpecialChars = false
  } = options;
  
  return (req, res, next) => {
    const locale = detectLocale(req.headers);
    const password = req.body[fieldName];
    
    if (!password) {
      return next(); // Let required field validation handle this
    }
    
    const validationErrors = [];
    
    if (password.length < minLength) {
      validationErrors.push(`Password must be at least ${minLength} characters long`);
    }
    
    if (password.length > maxLength) {
      validationErrors.push(`Password must be no longer than ${maxLength} characters`);
    }
    
    if (requireUppercase && !/[A-Z]/.test(password)) {
      validationErrors.push('Password must contain at least one uppercase letter');
    }
    
    if (requireLowercase && !/[a-z]/.test(password)) {
      validationErrors.push('Password must contain at least one lowercase letter');
    }
    
    if (requireNumbers && !/\d/.test(password)) {
      validationErrors.push('Password must contain at least one number');
    }
    
    if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      validationErrors.push('Password must contain at least one special character');
    }
    
    if (validationErrors.length > 0) {
      return sendValidationError(res, 'user.errors.password_validation', locale, validationErrors);
    }
    
    next();
  };
}

/**
 * Validate username format
 * @param {string} fieldName - Name of the username field (default: 'username')
 * @returns {Function} Express middleware function
 */
function validateUsername(fieldName = 'username') {
  return (req, res, next) => {
    const locale = detectLocale(req.headers);
    const username = req.body[fieldName];
    
    if (!username) {
      return next(); // Let required field validation handle this
    }
    
    // Username validation: alphanumeric and underscore, 3-50 characters
    const usernameRegex = /^[a-zA-Z0-9_]{3,50}$/;
    if (!usernameRegex.test(username)) {
      return sendValidationError(res, 'user.errors.invalid_username', locale, [fieldName]);
    }
    
    next();
  };
}

/**
 * Sanitize input fields
 * @param {Array} fieldsToSanitize - Array of field names to sanitize
 * @returns {Function} Express middleware function
 */
function sanitizeFields(fieldsToSanitize) {
  return (req, res, next) => {
    for (const field of fieldsToSanitize) {
      if (req.body[field] && typeof req.body[field] === 'string') {
        // Basic sanitization: trim whitespace
        req.body[field] = req.body[field].trim();
      }
    }
    next();
  };
}

module.exports = {
  validateRequiredFields,
  validateEmail,
  validatePassword,
  validateUsername,
  sanitizeFields
};
