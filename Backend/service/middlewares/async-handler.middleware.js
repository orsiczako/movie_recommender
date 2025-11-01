/**
 * Async error handling middleware
 */

const ApiResponse = require('../helpers/api-response.helper');

/**
 * Wrapper function that catches async errors in route handlers
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      console.error('[ASYNC ERROR]:', error);
      return ApiResponse.serverError(res, error);
    });
  };
};

module.exports = asyncHandler;