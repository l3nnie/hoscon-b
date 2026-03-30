
import SessionService from '../services/sessionService.js';

export const authenticateSession = async (req, res, next) => {
  try {
    // Get session token from Authorization header, X-Session-Token header, or cookie
    const authHeader = req.headers.authorization;
    const customToken = req.headers['x-session-token'];
    const sessionToken = authHeader?.replace('Bearer ', '') || customToken || req.cookies?.sessionToken;

    //console.log('🔐 Auth middleware - Request URL:', req.url);
    //console.log('🔐 Auth middleware - All headers:', Object.keys(req.headers));
    //console.log('🔐 Auth middleware - Auth header:', authHeader ? authHeader.substring(0, 20) + '...' : 'none');
    //console.log('🔐 Auth middleware - Custom token:', customToken ? customToken.substring(0, 20) + '...' : 'none');
    //console.log('🔐 Auth middleware - Session token present:', !!sessionToken);
    //console.log('🔐 Auth middleware - Cookies:', req.cookies);

    if (!sessionToken) {
      console.log('❌ No session token found - returning 401');
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await SessionService.validateSession(sessionToken);

    if (!user) {
     // console.log('❌ Session validation failed for token:', sessionToken.substring(0, 8) + '...');
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

   // console.log('✅ Session validated for user:', user.email, 'role:', user.role);
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    next(error);
  }
};

export const requireAdmin = async (req, res, next) => {
  try {
    // First check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if user has admin role (accept both 'admin' and 'supabaseAdmin')
    if (req.user.role !== 'admin' && req.user.role !== 'supabaseAdmin') {
      console.log('User role not authorized:', req.user.role);
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error) {
    console.error('Require admin middleware error:', error);
    next(error);
  }
};