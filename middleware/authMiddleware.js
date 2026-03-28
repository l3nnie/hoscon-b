
import { supabaseAdmin } from '../config/supabase.js';

export const authenticateSession = async (req, res, next) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ error: 'Session required' });
    }
    
    // Optional: verify user still exists
    const { data: user, error: userError } = await supabaseAdmin
      .from('admin_users')
      .select('id, email, role')
      .eq('id', req.session.user.id)
      .single();
    
    if (userError || !user) {
      return res.status(401).json({ error: 'User not found' });
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
    // First check if session user exists
    if (!req.session || !req.session.user) {
      return res.status(401).json({ error: 'Session required' });
    }
    
    // Verify user has admin role in database
    const { data: user, error: userError } = await supabaseAdmin
      .from('admin_users')
      .select('id, email, role')
      .eq('id', req.session.user.id)
      .single();
    
    if (userError || !user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    next(error);
  }
};