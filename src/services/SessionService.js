/**
 * Session Management Service
 * Handles user session storage and retrieval using AsyncStorage
 * Sessions are stored locally, not in database
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = '@customer_session';
const SESSION_TOKEN_KEY = '@session_token';

class SessionService {
  /**
   * Create and store a user session
   * @param {object} customerData - Customer data from login
   * @returns {Promise<boolean>} True if session created successfully
   */
  static async createSession(customerData) {
    try {
      if (!customerData || !customerData.customerId) {
        console.error('❌ Cannot create session: missing customer data');
        return false;
      }

      // Generate a session token (simple timestamp-based token)
      const sessionToken = `session_${customerData.customerId}_${Date.now()}`;
      
      // Create session object with 1 month (30 days) expiration
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days = 1 month
      
      const session = {
        token: sessionToken,
        customerId: customerData.customerId,
        customerName: customerData.customerName || customerData.username || '',
        email: customerData.email || '',
        mobileNumber: customerData.mobileNumber || '',
        address: customerData.address || '',
        city: customerData.city || '',
        state: customerData.state || '',
        userType: customerData.userType || '',
        status: customerData.status || '',
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(), // 1 month from now
      };
      
      console.log('📅 Session expiration set:', {
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        duration: '30 days (1 month)',
      });

      // Store session in AsyncStorage
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
      await AsyncStorage.setItem(SESSION_TOKEN_KEY, sessionToken);
      
      console.log('✅ Session created and stored:', {
        customerId: customerData.customerId,
        token: sessionToken.substring(0, 20) + '...',
      });
      
      return true;
    } catch (error) {
      console.error('❌ Error creating session:', error);
      return false;
    }
  }

  /**
   * Get current session from AsyncStorage
   * @returns {Promise<object|null>} Session object or null if not found or expired
   */
  static async getSession() {
    try {
      const sessionData = await AsyncStorage.getItem(SESSION_KEY);
      
      if (!sessionData) {
        console.log('📭 No session found in AsyncStorage');
        return null;
      }

      const session = JSON.parse(sessionData);
      
      // Check if session is expired (1 month = 30 days)
      const expiresAt = new Date(session.expiresAt);
      const now = new Date();
      
      if (now > expiresAt) {
        console.log('⏰ Session expired (1 month limit reached), auto-logging out...');
        console.log(`   Session created: ${session.createdAt}`);
        console.log(`   Session expired: ${session.expiresAt}`);
        console.log(`   Current time: ${now.toISOString()}`);
        await this.clearSession();
        return null;
      }

      // Calculate days remaining
      const daysRemaining = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
      console.log('✅ Session retrieved:', {
        customerId: session.customerId,
        expiresAt: session.expiresAt,
        daysRemaining: daysRemaining,
      });
      
      return session;
    } catch (error) {
      console.error('❌ Error getting session:', error);
      return null;
    }
  }

  /**
   * Get session token
   * @returns {Promise<string|null>} Session token or null
   */
  static async getSessionToken() {
    try {
      const token = await AsyncStorage.getItem(SESSION_TOKEN_KEY);
      return token;
    } catch (error) {
      console.error('❌ Error getting session token:', error);
      return null;
    }
  }

  /**
   * Check if user is logged in (has active session)
   * @returns {Promise<boolean>} True if user has active session
   */
  static async isLoggedIn() {
    try {
      const session = await this.getSession();
      return session !== null;
    } catch (error) {
      console.error('❌ Error checking login status:', error);
      return false;
    }
  }

  /**
   * Clear session (logout)
   * @returns {Promise<boolean>} True if session cleared successfully
   */
  static async clearSession() {
    try {
      await AsyncStorage.removeItem(SESSION_KEY);
      await AsyncStorage.removeItem(SESSION_TOKEN_KEY);
      console.log('✅ Session cleared from AsyncStorage');
      return true;
    } catch (error) {
      console.error('❌ Error clearing session:', error);
      return false;
    }
  }

  /**
   * Update session data (e.g., after profile update)
   * @param {object} updates - Partial customer data to update
   * @returns {Promise<boolean>} True if session updated successfully
   */
  static async updateSession(updates) {
    try {
      const session = await this.getSession();
      
      if (!session) {
        console.warn('⚠️ Cannot update session: no active session');
        return false;
      }

      // Merge updates with existing session
      const updatedSession = {
        ...session,
        ...updates,
      };

      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
      console.log('✅ Session updated');
      return true;
    } catch (error) {
      console.error('❌ Error updating session:', error);
      return false;
    }
  }

  /**
   * Refresh session expiration (extend session)
   * Note: This extends the session from the current time, not from the original expiration
   * @returns {Promise<boolean>} True if session refreshed successfully
   */
  static async refreshSession() {
    try {
      const session = await this.getSession();
      
      if (!session) {
        console.warn('⚠️ Cannot refresh session: no active session');
        return false;
      }

      // Extend session for another 30 days (1 month) from now
      const newExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      session.expiresAt = newExpiresAt.toISOString();
      
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
      console.log('✅ Session refreshed:', {
        newExpiresAt: session.expiresAt,
        duration: '30 days (1 month)',
      });
      return true;
    } catch (error) {
      console.error('❌ Error refreshing session:', error);
      return false;
    }
  }

  /**
   * Check if session is expired
   * @returns {Promise<boolean>} True if session is expired, false otherwise
   */
  static async isSessionExpired() {
    try {
      const session = await this.getSession();
      return session === null;
    } catch (error) {
      console.error('❌ Error checking session expiration:', error);
      return true; // Assume expired if error
    }
  }

  /**
   * Get session expiration info
   * @returns {Promise<object|null>} Object with expiration details or null if no session
   */
  static async getSessionExpirationInfo() {
    try {
      const sessionData = await AsyncStorage.getItem(SESSION_KEY);
      
      if (!sessionData) {
        return null;
      }

      const session = JSON.parse(sessionData);
      const expiresAt = new Date(session.expiresAt);
      const now = new Date();
      const isExpired = now > expiresAt;
      const daysRemaining = isExpired 
        ? 0 
        : Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
      
      return {
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        isExpired,
        daysRemaining,
        hoursRemaining: isExpired 
          ? 0 
          : Math.ceil((expiresAt - now) / (1000 * 60 * 60)),
      };
    } catch (error) {
      console.error('❌ Error getting session expiration info:', error);
      return null;
    }
  }
}

export default SessionService;

