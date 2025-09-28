/**
 * Egységes API response helper
 */

const { t, detectLocale } = require('./messages.helper');

class ApiResponse {
  static success(res, messageKey, data = null, statusCode = 200) {
    const locale = detectLocale(res.req.headers);
    const response = {
      success: true,
      message: t(locale, messageKey)
    };

    if (data) {
      Object.assign(response, data);
    }

    return res.status(statusCode).json(response);
  }

  static error(res, messageKey, statusCode = 400, errorCode = null) {
    const locale = detectLocale(res.req.headers);
    const response = {
      success: false,
      message: t(locale, messageKey)
    };

    if (errorCode) {
      response.errorCode = errorCode;
    }

    return res.status(statusCode).json(response);
  }

  static serverError(res, error = null) {
    const locale = detectLocale(res.req.headers);
    console.error('[SERVER ERROR]:', error);
    
    return res.status(500).json({
      success: false,
      message: t(locale, 'user.errors.server_error'),
      ...(process.env.NODE_ENV === 'development' && error && { debug: error.message })
    });
  }

  static validationError(res, messageKey = 'user.errors.missing_fields') {
    return this.error(res, messageKey, 400, 'VALIDATION_ERROR');
  }
}

module.exports = ApiResponse;