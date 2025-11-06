/**
 * Push Notification Service
 * Handles Firebase Cloud Messaging (FCM) integration for push notifications
 */

// API Base URL Configuration
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5000'  // ✅ For iOS Simulator - use localhost
  : 'https://your-production-url.com';  // Production URL

class PushNotificationService {
  /**
   * Request push notification permission from user
   * @returns {Promise<boolean>} True if permission granted
   */
  static async requestPermission() {
    try {
      // Dynamic import to avoid errors if Firebase not installed
      const messaging = require('@react-native-firebase/messaging').default;
      
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('✅ Push notification permission granted');
        return true;
      } else {
        console.log('❌ Push notification permission denied');
        return false;
      }
    } catch (error) {
      console.warn('⚠️ Firebase Messaging not configured. Push notifications disabled.');
      console.warn('To enable push notifications, install @react-native-firebase/messaging');
      return false;
    }
  }

  /**
   * Get FCM device token
   * @returns {Promise<string|null>} Device token or null
   */
  static async getToken() {
    try {
      const messaging = require('@react-native-firebase/messaging').default;
      const token = await messaging().getToken();
      console.log('📱 FCM Token:', token);
      return token;
    } catch (error) {
      console.warn('⚠️ Could not get FCM token:', error.message);
      return null;
    }
  }

  /**
   * Register device token with backend
   * @param {string} customerId - Customer ID
   * @param {string} token - FCM device token
   * @param {string} platform - 'ios' or 'android'
   * @returns {Promise<boolean>} True if registration successful
   */
  static async registerDeviceToken(customerId, token, platform = 'android') {
    if (!customerId || !token) {
      console.warn('⚠️ Cannot register device token: missing customerId or token');
      return false;
    }

    try {
      console.log('📤 Registering device token for customer:', customerId);
      
      // Use fetch with timeout (60 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      
      let response;
      try {
        response = await fetch(`${API_BASE_URL}/api/notifications/register-device`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerId: customerId,
            deviceToken: token,
            platform: platform,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          throw new Error('Request timeout after 60 seconds');
        }
        throw error;
      }

      const result = await response.json();
      if (result.status === 'success') {
        console.log('✅ Device token registered successfully');
        return true;
      } else {
        console.error('❌ Failed to register device token:', result.message);
        return false;
      }
    } catch (error) {
      console.error('❌ Error registering device token:', error);
      return false;
    }
  }

  /**
   * Setup notification handlers
   * Call this once when app starts
   */
  static setupNotificationHandlers() {
    try {
      const messaging = require('@react-native-firebase/messaging').default;
      const { Platform } = require('react-native');

      // Handle foreground messages (when app is open)
      messaging().onMessage(async remoteMessage => {
        console.log('📬 Foreground notification received:', remoteMessage);
        // You can show a local notification here using react-native-push-notification
        // or update the UI to show a notification banner
      });

      // Handle background messages (when app is in background)
      messaging().setBackgroundMessageHandler(async remoteMessage => {
        console.log('📬 Background notification received:', remoteMessage);
      });

      // Handle notification taps (when user taps notification)
      messaging().onNotificationOpenedApp(remoteMessage => {
        console.log('📬 Notification opened app:', remoteMessage);
        // Navigate to relevant screen based on notification data
      });

      // Check if app was opened from terminated state via notification
      messaging()
        .getInitialNotification()
        .then(remoteMessage => {
          if (remoteMessage) {
            console.log('📬 App opened from notification:', remoteMessage);
            // Navigate to relevant screen
          }
        });

      console.log('✅ Push notification handlers setup complete');
    } catch (error) {
      console.warn('⚠️ Could not setup notification handlers:', error.message);
      console.warn('To enable push notifications, install @react-native-firebase/messaging');
    }
  }

  /**
   * Initialize push notifications for a customer
   * @param {string} customerId - Customer ID
   * @param {string} platform - 'ios' or 'android'
   */
  static async initialize(customerId, platform = 'android') {
    if (!customerId) {
      console.warn('⚠️ Cannot initialize push notifications: missing customerId');
      return;
    }

    try {
      // Request permission
      const hasPermission = await this.requestPermission();
      
      if (hasPermission) {
        // Get device token
        const token = await this.getToken();
        
        if (token) {
          // Register token with backend
          await this.registerDeviceToken(customerId, token, platform);
        }
      }

      // Setup handlers
      this.setupNotificationHandlers();
    } catch (error) {
      console.error('❌ Error initializing push notifications:', error);
    }
  }
}

export default PushNotificationService;

