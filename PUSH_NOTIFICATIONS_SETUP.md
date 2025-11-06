# Push Notifications Setup Guide

This guide explains how to set up push notifications using Firebase Cloud Messaging (FCM) for the B2C Customer App.

## Prerequisites

1. Firebase account (https://firebase.google.com)
2. React Native project setup
3. Backend API running

## Backend Setup

### 1. Database Tables

Run the SQL script to create required tables:

```bash
mysql -u OSGCORER -p customer_app_db < backend/create_notifications_tables.sql
```

Or manually run the SQL from `backend/create_notifications_tables.sql`

### 2. API Endpoints Created

The following endpoints are already available:

- **GET** `/api/notifications?customerId={customerId}` - Get all notifications
- **POST** `/api/notifications/mark-read` - Mark notification(s) as read
- **POST** `/api/notifications/register-device` - Register device token for push notifications

## Frontend Setup (React Native)

### Step 1: Install Firebase Dependencies

```bash
npm install @react-native-firebase/app @react-native-firebase/messaging
```

For iOS:
```bash
cd ios && pod install && cd ..
```

### Step 2: Firebase Configuration

1. **Create Firebase Project:**
   - Go to https://console.firebase.google.com
   - Create a new project or use existing
   - Add Android and iOS apps to the project

2. **Android Setup:**
   - Download `google-services.json` from Firebase Console
   - Place it in `android/app/google-services.json`
   - Update `android/build.gradle`:
   ```gradle
   dependencies {
       classpath 'com.google.gms:google-services:4.3.15'
   }
   ```
   - Update `android/app/build.gradle`:
   ```gradle
   apply plugin: 'com.google.gms.google-services'
   ```

3. **iOS Setup:**
   - Download `GoogleService-Info.plist` from Firebase Console
   - Place it in `ios/YourApp/GoogleService-Info.plist`
   - Add it to Xcode project

### Step 3: Create Push Notification Service

Create `src/services/PushNotificationService.js`:

```javascript
import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5000'
  : 'https://your-production-url.com';

class PushNotificationService {
  static async requestPermission() {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Push notification permission granted');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    }
  }

  static async getToken() {
    try {
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  static async registerDeviceToken(customerId, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/register-device`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: customerId,
          deviceToken: token,
          platform: Platform.OS,
        }),
      });

      const result = await response.json();
      if (result.status === 'success') {
        console.log('Device token registered successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error registering device token:', error);
      return false;
    }
  }

  static setupNotificationHandlers() {
    // Handle foreground messages
    messaging().onMessage(async remoteMessage => {
      console.log('Foreground notification:', remoteMessage);
      // You can show a local notification here
    });

    // Handle background messages
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Background notification:', remoteMessage);
    });

    // Handle notification taps
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification opened app:', remoteMessage);
    });

    // Check if app was opened from terminated state
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('App opened from notification:', remoteMessage);
        }
      });
  }
}

export default PushNotificationService;
```

### Step 4: Initialize in App.jsx

Add to your App.jsx:

```javascript
import PushNotificationService from './src/services/PushNotificationService';
import messaging from '@react-native-firebase/messaging';

// In your component or useEffect:
useEffect(() => {
  // Request permission
  PushNotificationService.requestPermission().then(hasPermission => {
    if (hasPermission) {
      // Get token
      PushNotificationService.getToken().then(token => {
        if (token && profileData?.customerId) {
          // Register token with backend
          PushNotificationService.registerDeviceToken(profileData.customerId, token);
        }
      });
    }
  });

  // Setup notification handlers
  PushNotificationService.setupNotificationHandlers();
}, [profileData?.customerId]);
```

## Sending Push Notifications

### Option 1: Using Firebase Console (Manual)
1. Go to Firebase Console → Cloud Messaging
2. Create new notification
3. Target users by device tokens or customer IDs

### Option 2: Using Backend API (Automated)

Create an endpoint to send notifications (admin/backend use):

```python
from firebase_admin import messaging, initialize_app, credentials

# Initialize Firebase Admin (in app.py or separate service)
# cred = credentials.Certificate('path/to/service-account-key.json')
# initialize_app(cred)

@app.route('/api/notifications/send', methods=['POST'])
def send_notification():
    """
    Send push notification to customer(s).
    Admin/backend endpoint.
    """
    data = request.get_json()
    customer_id = data.get('customerId')
    title = data.get('title')
    message = data.get('message')
    notification_type = data.get('type', 'system')
    
    # Get device tokens for customer
    tokens_query = "SELECT device_token FROM b2c_device_tokens WHERE customer_id = %s"
    tokens_result = db.execute_query(tokens_query, (customer_id,))
    
    if not tokens_result:
        return jsonify({'status': 'error', 'message': 'No device tokens found'}), 404
    
    tokens = [row['device_token'] for row in tokens_result]
    
    # Send notification
    notification = messaging.MulticastMessage(
        notification=messaging.Notification(
            title=title,
            body=message,
        ),
        data={'type': notification_type},
        tokens=tokens,
    )
    
    response = messaging.send_multicast(notification)
    return jsonify({'status': 'success', 'successCount': response.success_count}), 200
```

## Testing

1. **Test API:**
```bash
curl "http://localhost:5000/api/notifications?customerId=1001"
```

2. **Register Device Token:**
```bash
curl -X POST http://localhost:5000/api/notifications/register-device \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "1001",
    "deviceToken": "test_token_123",
    "platform": "android"
  }'
```

3. **Mark Notification as Read:**
```bash
curl -X POST http://localhost:5000/api/notifications/mark-read \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "1001",
    "notificationId": 1
  }'
```

## Notes

- Notifications are fetched from database when NotificationScreen loads
- Device tokens are registered after successful login
- Push notifications require Firebase setup
- For testing, you can insert notifications directly in the database

