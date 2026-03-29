import AuthService from '../services/authService.js';  
import ApiResponse from '../utils/response.js';  
import { supabaseAdmin } from '../config/supabase.js';  
  
export const login = async (req, res, next) => {  
  try {  
    const { email, password } = req.validatedData || req.body;  
  
    if (!email || !password) {  
      return ApiResponse.error(res, 'Email and password are required', 400);  
    }  
  
    const result = await AuthService.login(email, password);  
  
    // Set session  
    req.session.user = result;  
    req.session.userId = result.id;  
  
    // Return user wrapped so frontend can read responseData.data.user  
    ApiResponse.success(res, { user: result }, 'Login successful');  
  } catch (error) {  
    if (error.message === 'Invalid credentials') {  
      return ApiResponse.error(res, error.message, 401);  
    }  
    next(error);  
  }  
};  
  
export const register = async (req, res, next) => {  
  try {  
    const userData = req.validatedData || req.body;  
  
    if (!userData.email || !userData.password) {  
      return ApiResponse.error(res, 'Email and password are required', 400);  
    }  
  
    const newUser = await AuthService.register(userData);  
  
    ApiResponse.created(res, newUser, 'User registered successfully');  
  } catch (error) {  
    if (error.message === 'User already exists') {  
      return ApiResponse.error(res, error.message, 409);  
    }  
    next(error);  
  }  
};  
  
export const changePassword = async (req, res, next) => {  
  try {  
    const { currentPassword, newPassword } = req.body;  
    const userId = req.user?.id;  
  
    if (!userId) {  
      return ApiResponse.error(res, 'User not authenticated', 401);  
    }  
  
    if (!currentPassword || !newPassword) {  
      return ApiResponse.error(res, 'Current password and new password are required', 400);  
    }  
  
    const result = await AuthService.changePassword(userId, currentPassword, newPassword);  
  
    ApiResponse.success(res, result, 'Password changed successfully');  
  } catch (error) {  
    next(error);  
  }  
};  
  
export const logout = async (req, res, next) => {  
  try {  
    await AuthService.logout();  
    req.session.destroy((err) => {  
      if (err) {  
        return next(err);  
      }  
      res.clearCookie('connect.sid');  
      ApiResponse.success(res, { success: true }, 'Logged out successfully');  
    });  
  } catch (error) {  
    next(error);  
  }  
};  
  
export const verifySession = async (req, res, next) => {  
  try {  
    if (req.session && req.session.user) {  
      const { data: user, error: userError } = await supabaseAdmin  
        .from('admin_users')  
        .select('id, email, role')  
        .eq('id', req.session.user.id)  
        .single();  
  
      if (!userError && user) {  
        return ApiResponse.success(res, { valid: true, user }, 'Session is valid');  
      }  
    }  
  
    ApiResponse.success(res, { valid: false, user: null }, 'No active session');  
  } catch (error) {  
    next(error);  
  }  
};