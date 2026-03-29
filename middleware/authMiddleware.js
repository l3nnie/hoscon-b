
import SessionService from '../services/sessionService.js';

export const authenticateSession = async (req, res, next) => {
  try {
    // Get session token from Authorization header or cookie
    const sessionToken = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.sessionToken;

    if (!sessionToken) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await SessionService.validateSession(sessionToken);

    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    next(error);
  }
};

export const requireAdmin = async (req, res, next) => {
  try {
    // First check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error) {
    console.error('Require admin middleware error:', error);
    next(error);
  }
};