/**
 * Authentication Middleware
 */

const jwt = require('jsonwebtoken');
const ApiResponse = require('../helpers/api-response.helper');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return ApiResponse.error(res, 'auth.errors.token_required', 401);
  }

  jwt.verify(token, process.env.JWT_SECRET || 'demo-secret-key', (err, decoded) => {
    if (err) {
      return ApiResponse.error(res, 'auth.errors.invalid_token', 403);
    }
    
    req.user = decoded;
    next();
  });
};

module.exports = {
  authenticateToken
};