import { supabaseAdmin } from '../config/supabase.js';
import bcrypt from 'bcryptjs';

class UserModel {
  /**
   * Find admin user by email
   */
  static async findByEmail(email) {
    try {
      const { data, error } = await supabaseAdmin
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error in UserModel.findByEmail:', error);
      throw error;
    }
  }
  
  /**
   * Find admin user by ID
   */
  static async findById(id) {
    try {
      const { data, error } = await supabaseAdmin
        .from('admin_users')
        .select('id, email, full_name, role, created_at, last_login')
        .eq('id', id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error in UserModel.findById:', error);
      throw error;
    }
  }
  
  /**
   * Create new admin user
   */
  static async create(userData) {
    try {
      const { email, password, fullName, role = 'admin' } = userData;
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      
      const { data, error } = await supabaseAdmin
        .from('admin_users')
        .insert({
          email,
          password_hash: passwordHash,
          full_name: fullName,
          role
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Return user without password hash
      const { password_hash, ...userWithoutPassword } = data;
      return userWithoutPassword;
    } catch (error) {
      console.error('Error in UserModel.create:', error);
      throw error;
    }
  }
  
  /**
   * Update user's last login time
   */
  static async updateLastLogin(id) {
    try {
      const { error } = await supabaseAdmin
        .from('admin_users')
        .update({ last_login: new Date() })
        .eq('id', id);
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error in UserModel.updateLastLogin:', error);
      throw error;
    }
  }
  
  /**
   * Update user password
   */
  static async updatePassword(id, newPassword) {
    try {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(newPassword, salt);
      
      const { error } = await supabaseAdmin
        .from('admin_users')
        .update({ password_hash: passwordHash })
        .eq('id', id);
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error in UserModel.updatePassword:', error);
      throw error;
    }
  }
  
  /**
   * Update user profile
   */
  static async updateProfile(id, profileData) {
    try {
      const { full_name, email } = profileData;
      
      const updateData = {};
      if (full_name) updateData.full_name = full_name;
      if (email) updateData.email = email;
      
      const { data, error } = await supabaseAdmin
        .from('admin_users')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Return user without password hash
      const { password_hash, ...userWithoutPassword } = data;
      return userWithoutPassword;
    } catch (error) {
      console.error('Error in UserModel.updateProfile:', error);
      throw error;
    }
  }
  
  /**
   * Verify password
   */
  static async verifyPassword(email, password) {
    try {
      const user = await this.findByEmail(email);
      if (!user) return false;
      
      const isValid = await bcrypt.compare(password, user.password_hash);
      return isValid;
    } catch (error) {
      console.error('Error in UserModel.verifyPassword:', error);
      throw error;
    }
  }
  
  /**
   * Get all admin users
   */
  static async findAll() {
    try {
      const { data, error } = await supabaseAdmin
        .from('admin_users')
        .select('id, email, full_name, role, created_at, last_login')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error in UserModel.findAll:', error);
      throw error;
    }
  }
  
  /**
   * Delete admin user
   */
  static async delete(id) {
    try {
      const { error } = await supabaseAdmin
        .from('admin_users')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error in UserModel.delete:', error);
      throw error;
    }
  }
}

export default UserModel;