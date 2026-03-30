import AuthService from '../services/authService.js';
import SessionService from '../services/sessionService.js';
import ApiResponse from '../utils/response.js';
import { supabaseAdmin } from '../config/supabase.js';  
  
export const login = async (req, res, next) => {  
  try {  
    const { email, password } = req.validatedData || req.body;  
  
    if (!email || !password) {  
      return ApiResponse.error(res, 'Email and password are required', 400);  
    }  
  
    const result = await AuthService.login(email, password);  
  
    // Create session  
    const sessionToken = await SessionService.createSession(result, req);  
    console.log('Session created for user:', result.email);  
  
    // Return user and session token  
    ApiResponse.success(res, {  
      user: result,  
      sessionToken  
    }, 'Login successful');  
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
    // Get session token from Authorization header or cookie  
    const sessionToken = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.sessionToken;  
  
    if (sessionToken) {  
      await SessionService.destroySession(sessionToken);  
    }  
  
    // Clear any cookies  
    res.clearCookie('sessionToken');  
  
    ApiResponse.success(res, { success: true }, 'Logged out successfully');  
  } catch (error) {  
    next(error);  
  }  
};  
  
export const verifySession = async (req, res, next) => {  
  try {  
    // Get session token from Authorization header or cookie  
    const sessionToken = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.sessionToken;  
  
    console.log('Verifying session...');  
    console.log('Session token present:', !!sessionToken);  
  
    if (!sessionToken) {  
      console.log('No session token provided');  
      return ApiResponse.success(res, { valid: false, user: null }, 'No active session');  
    }  
  
    const user = await SessionService.validateSession(sessionToken);  
  
    if (!user) {  
      console.log('Session validation failed');  
      return ApiResponse.success(res, { valid: false, user: null }, 'Session expired or invalid');  
    }  
  
    //console.log('Session validated for user:', user.email);  
    ApiResponse.success(res, { valid: true, user }, 'Session is valid');  
  } catch (error) {  
    console.error('Verify session error:', error);  
    next(error);  
  }  
};