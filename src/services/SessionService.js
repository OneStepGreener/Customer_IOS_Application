import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = '@B2C_CustomerApp:session';
const PROFILE_DATA_KEY = '@B2C_CustomerApp:profileData';

class SessionService {
  /**
   * Save user session data
   * @param {Object} sessionData - Session data to save
   * @param {string} sessionData.customerId - Customer ID
   * @param {string} sessionData.mobileNumber - Mobile number
   * @param {Object} profileData - Profile data to save
   */
  static async saveSession(sessionData, profileData) {
    try {
      // Save session data
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
      
      // Save profile data
      if (profileData) {
        await AsyncStorage.setItem(PROFILE_DATA_KEY, JSON.stringify(profileData));
      }
      
      console.log('✅ Session saved successfully');
      return true;
    } catch (error) {
      console.error('❌ Error saving session:', error);
      return false;
    }
  }

  /**
   * Get saved session data
   * @returns {Object|null} Session data or null if not found
   */
  static async getSession() {
    try {
      const sessionData = await AsyncStorage.getItem(SESSION_KEY);
      if (sessionData) {
        return JSON.parse(sessionData);
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting session:', error);
      return null;
    }
  }

  /**
   * Get saved profile data
   * @returns {Object|null} Profile data or null if not found
   */
  static async getProfileData() {
    try {
      const profileData = await AsyncStorage.getItem(PROFILE_DATA_KEY);
      if (profileData) {
        return JSON.parse(profileData);
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting profile data:', error);
      return null;
    }
  }

  /**
   * Clear session data
   */
  static async clearSession() {
    try {
      await AsyncStorage.removeItem(SESSION_KEY);
      await AsyncStorage.removeItem(PROFILE_DATA_KEY);
      console.log('✅ Session cleared successfully');
      return true;
    } catch (error) {
      console.error('❌ Error clearing session:', error);
      return false;
    }
  }

  /**
   * Check if user is logged in
   * @returns {boolean} True if session exists
   */
  static async isLoggedIn() {
    try {
      const session = await this.getSession();
      return session !== null && session.customerId !== null;
    } catch (error) {
      console.error('❌ Error checking login status:', error);
      return false;
    }
  }

  /**
   * Get customer ID from session
   * @returns {string|null} Customer ID or null
   */
  static async getCustomerId() {
    try {
      const session = await this.getSession();
      return session?.customerId || null;
    } catch (error) {
      console.error('❌ Error getting customer ID:', error);
      return null;
    }
  }
}

export default SessionService;

