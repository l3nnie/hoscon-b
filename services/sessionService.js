import { supabaseAdmin } from '../config/supabase.js';
import crypto from 'crypto';

class SessionService {
  /**
   * Create a new session for a user
   * @param {Object} user - User object
   * @param {Object} req - Express request object
   * @returns {string} Session token
   */
  static async createSession(user, req) {
    try {
      // Generate a unique session token
      const sessionToken = crypto.randomBytes(32).toString('hex');

      // Get user agent and IP for security tracking
      const userAgent = req.get('User-Agent') || 'Unknown';
      const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown';

      // Calculate expiry (7 days from now)
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      // Store session in database
      const { data: session, error } = await supabaseAdmin
        .from('user_sessions')
        .insert({
          user_id: user.id,
          session_token: sessionToken,
          expires_at: expiresAt.toISOString(),
          user_agent: userAgent,
          ip_address: ipAddress,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating session:', error);
        throw new Error('Failed to create session');
      }

      console.log(`Session created for user ${user.email} with token ${sessionToken.substring(0, 8)}...`);
      return sessionToken;
    } catch (error) {
      console.error('Session creation error:', error);
      throw error;
    }
  }

  /**
   * Validate a session token
   * @param {string} sessionToken - Session token to validate
   * @returns {Object|null} User object if valid, null if invalid
   */
  static async validateSession(sessionToken) {
    try {
      if (!sessionToken) {
        return null;
      }

      // Find session in database
      const { data: session, error } = await supabaseAdmin
        .from('user_sessions')
        .select(`
          *,
          admin_users (
            id,
            email,
            role,
            full_name,
            created_at
          )
        `)
        .eq('session_token', sessionToken)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !session) {
        console.log('Session not found or expired');
        return null;
      }

      // Check if user still exists and is active
      if (!session.admin_users) {
        console.log('User not found for session');
        await this.destroySession(sessionToken);
        return null;
      }

      console.log(`Session validated for user ${session.admin_users.email}`);
      return session.admin_users;
    } catch (error) {
      console.error('Session validation error:', error);
      return null;
    }
  }

  /**
   * Destroy a session
   * @param {string} sessionToken - Session token to destroy
   */
  static async destroySession(sessionToken) {
    try {
      const { error } = await supabaseAdmin
        .from('user_sessions')
        .delete()
        .eq('session_token', sessionToken);

      if (error) {
        console.error('Error destroying session:', error);
      } else {
        console.log(`Session destroyed: ${sessionToken.substring(0, 8)}...`);
      }
    } catch (error) {
      console.error('Session destruction error:', error);
    }
  }

  /**
   * Clean up expired sessions
   * This should be run periodically (e.g., via cron job)
   */
  static async cleanupExpiredSessions() {
    try {
      const { data, error } = await supabaseAdmin
        .from('user_sessions')
        .delete()
        .lt('expires_at', new Date().toISOString());

      if (error) {
        console.error('Error cleaning up expired sessions:', error);
      } else {
        console.log(`Cleaned up ${data?.length || 0} expired sessions`);
      }
    } catch (error) {
      console.error('Session cleanup error:', error);
    }
  }

  /**
   * Get all active sessions for a user
   * @param {string} userId - User ID
   * @returns {Array} Array of active sessions
   */
  static async getUserSessions(userId) {
    try {
      const { data: sessions, error } = await supabaseAdmin
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting user sessions:', error);
        return [];
      }

      return sessions || [];
    } catch (error) {
      console.error('Get user sessions error:', error);
      return [];
    }
  }

  /**
   * Destroy all sessions for a user (useful for logout from all devices)
   * @param {string} userId - User ID
   */
  static async destroyAllUserSessions(userId) {
    try {
      const { error } = await supabaseAdmin
        .from('user_sessions')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Error destroying all user sessions:', error);
      } else {
        console.log(`Destroyed all sessions for user ${userId}`);
      }
    } catch (error) {
      console.error('Destroy all user sessions error:', error);
    }
  }
}

export default SessionService;