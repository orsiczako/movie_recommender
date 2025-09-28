/**
 * USER API routes - Clean and DRY
 */

const express = require('express');
const UserController = require('../../../controllers/user.controller');
const ApiResponse = require('../../../service/helpers/api-response.helper');
const asyncHandler = require('../../../service/middlewares/async-handler.middleware');
const { validateRequired, validateEmailTemplate } = require('../../../service/middlewares/request-validation.middleware');
const { authenticateToken } = require('../../../service/middlewares/auth.middleware');

module.exports = (User) => {
  const router = express.Router();
  const userController = new UserController(User);

  // POST /login
  router.post('/login', 
    validateRequired('username', 'password'),
    asyncHandler(async (req, res) => {
      const { username, password } = req.body;
      const result = await userController.login(username, password);
      
      if (!result.success) {
        const msg = result.error === 'INVALID_CREDENTIALS' 
          ? 'user.errors.invalid_credentials' 
          : 'user.errors.server_error';
        return ApiResponse.error(res, msg, 401);
      }

      return ApiResponse.success(res, 'user.success.login_success', {
        redirect: '/dashboard',
        user: result.user,
        token: result.token
      });
    })
  );

  // POST /register
  router.post('/register',
    validateRequired('username', 'password', 'email', 'fullName'),
    asyncHandler(async (req, res) => {
      const { username, password, email, fullName } = req.body;
      
      try {
        const result = await userController.register({ username, password, email, fullName });
        
        return ApiResponse.success(res, 'user.success.registered', {
          user: result.user
        });
      } catch (error) {
        const msg = error.message === 'USERNAME_TAKEN' 
          ? 'user.errors.username_taken' 
          : 'user.errors.email_taken';
        return ApiResponse.error(res, msg, 409);
      }
    })
  );

  // POST /forgot-password
  router.post('/forgot-password',
    validateRequired('email'),
    validateEmailTemplate,
    asyncHandler(async (req, res) => {
      const { email, emailTemplate } = req.body;
      const result = await userController.forgotPassword(email, emailTemplate);
      
      if (!result.success && result.error === 'EMAIL_FAILED') {
        return ApiResponse.error(res, 'user.errors.email_send_failed', 500);
      }

      return ApiResponse.success(res, 'user.success.recovery_sent');
    })
  );

  // POST /reset-password
  router.post('/reset-password',
    validateRequired('token', 'password'),
    asyncHandler(async (req, res) => {
      const { token, password } = req.body;
      const result = await userController.resetPassword(token, password);
      
      if (!result.success) {
        const msg = result.error === 'INVALID_TOKEN' 
          ? 'user.errors.invalid_token' 
          : 'user.errors.token_expired';
        return ApiResponse.error(res, msg, 400);
      }

      return ApiResponse.success(res, 'user.success.password_reset');
    })
  );

  // GET /me - Get current user profile
  router.get('/me',
    authenticateToken,
    asyncHandler(async (req, res) => {
      const result = await userController.getUserProfile(req.user.id);
      
      if (!result.success) {
        return ApiResponse.error(res, 'user.errors.user_not_found', 404);
      }

      return ApiResponse.success(res, 'user.success.profile_retrieved', {
        user: result.user
      });
    })
  );

  // PUT /profile - Update user profile
  router.put('/profile',
    authenticateToken,
    validateRequired('fullName', 'email'),
    asyncHandler(async (req, res) => {
      const { fullName, email, bio } = req.body;
      const result = await userController.updateUserProfile(req.user.id, { fullName, email, bio });
      
      if (!result.success) {
        return ApiResponse.error(res, 'user.errors.update_failed', 400);
      }

      return ApiResponse.success(res, 'user.success.profile_updated', {
        user: result.user
      });
    })
  );

  return router;
};