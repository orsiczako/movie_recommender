/**
 * User Controller - Clean and simple
 */

const UserService = require('../service/business/user.service');

class UserController {
  constructor(User) {
    this.userService = new UserService(User);
  }

  async login(username, password) {
    return await this.userService.login(username, password);
  }

  async register(userData) {
    return await this.userService.register(userData);
  }

  async forgotPassword(email, emailTemplate) {
    return await this.userService.forgotPassword(email, emailTemplate);
  }

  async resetPassword(token, newPassword) {
    return await this.userService.resetPassword(token, newPassword);
  }

  async getUserProfile(userId) {
    return await this.userService.getUserProfile(userId);
  }

  async updateUserProfile(userId, updateData) {
    return await this.userService.updateUserProfile(userId, updateData);
  }
}

module.exports = UserController;
