import bcrypt from 'bcryptjs';
import UserModel from '../models/User.js';

class AuthService {
  /**
   * Login user and return user data for session
   * @param {string} email
   * @param {string} password
   * @returns {Object} User data
   */
  static async login(email, password) {
    try {
      // Find user
      const user = await UserModel.findByEmail(email);
      
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Update last login
      await UserModel.updateLastLogin(user.id);

      // Sanitize user data
      const { password_hash, ...userWithoutPassword } = user;

      return userWithoutPassword;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Register new admin user
   * @param {Object} userData - User registration data
   * @returns {Object} Created user
   */
  static async register(userData) {
    try {
      const { email, password, fullName } = userData;

      // Check if user exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        throw new Error('User already exists');
      }

      // Create user
      const newUser = await UserModel.create({
        email,
        password,
        fullName,
        role: 'admin'
      });

      return newUser;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Change password
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Object} Success status
   */
  static async changePassword(userId, currentPassword, newPassword) {
    try {
      // Find user
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get full user with password hash
      const fullUser = await UserModel.findByEmail(user.email);
      
      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, fullUser.password_hash);
      if (!isValid) {
        throw new Error('Current password is incorrect');
      }

      // Update password
      await UserModel.updatePassword(userId, newPassword);

      return { success: true, message: 'Password changed successfully' };
    } catch (error) {
      console.error('Password change error:', error);
      throw error;
    }
  }

  /**
   * Logout user
   * @returns {Object} Success status
   */
  static async logout() {
    return { success: true, message: 'Logged out successfully' };
  }
}

export default AuthService;