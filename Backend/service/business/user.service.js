/**
 * User Service - Clean business logic
 */

const { 
  encryptPassword, 
  verifyPassword, 
  generateSecureToken,
  hashToken,
  verifyToken,
  generateExpiration,
  isExpired,
  generateJwtToken
} = require('../helpers/security.helper');
const { sendMail } = require('../helpers/email.helper');

class UserService {
  constructor(User) {
    this.User = User;
  }

  async login(username, password) {
    const user = await this.User.findOne({ where: { login_name: username } });
    
    if (!user || !(await verifyPassword(password, user.login_password_hash))) {
      return { success: false, error: 'INVALID_CREDENTIALS' };
    }

    const userData = this.formatUser(user);
    const token = generateJwtToken(userData);

    return { 
      success: true, 
      user: userData,
      token: token
    };
  }

  async register(userData) {
    const { username, password, email, fullName } = userData;

    // Check duplicates
    await this.checkUserExists(username, email);

    // Create user
    const hash = await encryptPassword(password);
    const newUser = await this.User.create({
      login_name: username,
      login_password_hash: hash,
      email_address: email,
      full_name: fullName
    });

    return { 
      success: true, 
      user: this.formatUser(newUser)
    };
  }

  async forgotPassword(email, emailTemplate) {
    const user = await this.User.findOne({ where: { email_address: email } });
    
    // Always return success (security)
    if (!user) return { success: true };

    // Generate and save token
    const token = generateSecureToken();
    await user.update({
      password_recovery_hash: await hashToken(token),
      password_recovery_expires: generateExpiration(24)
    });

    // Send email
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    const emailContent = this.prepareEmailContent(emailTemplate, resetLink, user.full_name);
    
    const result = await sendMail(email, emailTemplate.subject, emailContent.text, emailContent.html);
    
    if (!result.success) {
      return { success: false, error: 'EMAIL_FAILED' };
    }

    return { success: true };
  }

  async resetPassword(token, newPassword) {
    const user = await this.findUserByToken(token);
    
    if (!user) return { success: false, error: 'INVALID_TOKEN' };
    if (isExpired(user.password_recovery_expires)) {
      return { success: false, error: 'TOKEN_EXPIRED' };
    }

    // Update password and clear recovery data
    await user.update({
      login_password_hash: await encryptPassword(newPassword),
      password_recovery_hash: null,
      password_recovery_expires: null
    });

    return { success: true };
  }

  async getUserProfile(userId) {
    const user = await this.User.findOne({ where: { account_id: userId } });
    
    if (!user) {
      return { success: false, error: 'USER_NOT_FOUND' };
    }

    return { 
      success: true, 
      user: this.formatUser(user)
    };
  }

  async updateUserProfile(userId, updateData) {
    const user = await this.User.findOne({ where: { account_id: userId } });
    
    if (!user) {
      return { success: false, error: 'USER_NOT_FOUND' };
    }

    // Frissítjük a felhasználói adatokat
    await user.update({
      full_name: updateData.fullName,
      email_address: updateData.email,
      bio: updateData.bio || null // Bio mentése
    });

    return { 
      success: true, 
      user: this.formatUser(user)
    };
  }

  async checkUserExists(username, email) {
    const [existingUser, existingEmail] = await Promise.all([
      this.User.findOne({ where: { login_name: username } }),
      this.User.findOne({ where: { email_address: email } })
    ]);

    if (existingUser) throw new Error('USERNAME_TAKEN');
    if (existingEmail) throw new Error('EMAIL_TAKEN');
  }

  async findUserByToken(token) {
    const users = await this.User.findAll({
      where: { password_recovery_hash: { [require('sequelize').Op.not]: null } }
    });

    for (const user of users) {
      if (await verifyToken(token, user.password_recovery_hash)) {
        return user;
      }
    }
    return null;
  }

  formatUser(user) {
    return {
      id: user.account_id,
      username: user.login_name,
      email: user.email_address,
      fullName: user.full_name,
      bio: user.bio
    };
  }

  prepareEmailContent(template, resetLink, userName = 'Felhasználó') {
    const html = template.html
      .replace(/\{recoveryLink\}/g, resetLink)
      .replace(/\{userFullName\}/g, userName);
    
    const text = template.text ? 
      template.text
        .replace(/\{recoveryLink\}/g, resetLink)
        .replace(/\{userFullName\}/g, userName) : '';

    return { html, text };
  }
}

module.exports = UserService;
