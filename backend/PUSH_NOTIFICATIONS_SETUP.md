# Push Notifications Setup Guide

## Overview

This app supports push notifications using Firebase Cloud Messaging (FCM) for both Android and iOS. The backend API is ready to receive and store device tokens.

## Backend API Endpoints

### 1. Register Device Token
**Endpoint:** `POST /api/notifications/register-device`

**Request:**
```json
{
  "customerId": "1001",
  "deviceToken": "fcm_token_here",
  "platform": "android"  // or "ios"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Device token registered successfully"
}
```

### 2. Get Notifications
**Endpoint:** `GET /api/notifications?customerId=1001`

**Response:**
```json
{
  "status": "success",
  "data": {
    "notifications": [...],
    "unreadCount": 2
  }
}
```

## Database Table (Auto-Created)

The backend automatically creates a `device_tokens` table when the first device token is registered. This table stores:
- `customer_id` - Links token to customer
- `device_token` - FCM/APNS token
- `platform` - 'ios' or 'android'
- `created_at` / `updated_at` - Timestamps

**Note:** This is a minimal table only for push notification tokens. Notifications themselves are generated dynamically from existing customer data (no notifications table needed).

## Frontend Setup (React Native)

### Step 1: Install Dependencies

```bash
npm install @react-native-firebase/app @react-native-firebase/messaging
```

For iOS:
```bash
cd ios && pod install
```

### Step 2: Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing
3. Add Android app:
   - Package name: `com.yourapp.b2ccustomerapp` (check your `android/app/build.gradle`)
   - Download `google-services.json` → place in `android/app/`
4. Add iOS app:
   - Bundle ID: Check your `ios/YourApp/Info.plist`
   - Download `GoogleService-Info.plist` → place in `ios/YourApp/`

### Step 3: Android Configuration

1. **Update `android/build.gradle`:**
```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.4.0'
    }
}
```

2. **Update `android/app/build.gradle`:**
```gradle
apply plugin: 'com.google.gms.google-services'
```

3. **Update `AndroidManifest.xml`:**
```xml
<application>
    <!-- Add this -->
    <service
        android:name="com.google.firebase.messaging.FirebaseMessagingService"
        android:exported="false">
        <intent-filter>
            <action android:name="com.google.firebase.MESSAGING_EVENT" />
        </intent-filter>
    </service>
</application>
```

### Step 4: iOS Configuration

1. **Update `ios/Podfile`:**
```ruby
pod 'Firebase/Messaging'
```

2. **Enable Push Notifications in Xcode:**
   - Open `ios/YourApp.xcworkspace` in Xcode
   - Select your app target → Signing & Capabilities
   - Add "Push Notifications" capability
   - Add "Background Modes" → Enable "Remote notifications"

### Step 5: Request Permissions & Get Token

Create a service file: `src/services/PushNotificationService.js`

```javascript
import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5000'
  : 'https://your-production-url.com';

class PushNotificationService {
  // Request permission and get token
  static async requestPermissionAndGetToken(customerId) {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('✅ Push notification permission granted');
        const token = await messaging().getToken();
        console.log('📱 FCM Token:', token);
        
        // Register token with backend
        await this.registerDeviceToken(customerId, token);
        return token;
      } else {
        console.log('❌ Push notification permission denied');
        return null;
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  // Register device token with backend
  static async registerDeviceToken(customerId, deviceToken) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/register-device`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: customerId,
          deviceToken: deviceToken,
          platform: Platform.OS === 'ios' ? 'ios' : 'android',
        }),
      });

      const result = await response.json();
      if (result.status === 'success') {
        console.log('✅ Device token registered successfully');
      } else {
        console.error('❌ Failed to register device token:', result.message);
      }
    } catch (error) {
      console.error('❌ Error registering device token:', error);
    }
  }

  // Setup notification handlers
  static setupNotificationHandlers() {
    // Foreground notifications
    messaging().onMessage(async remoteMessage => {
      console.log('📬 Notification received in foreground:', remoteMessage);
      // You can show a local notification here
    });

    // Background/Quit state notifications
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('📬 Notification opened app from background:', remoteMessage);
      // Navigate to relevant screen
    });

    // Check if app was opened from a notification
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('📬 App opened from notification:', remoteMessage);
        }
      });
  }
}

export default PushNotificationService;
```

### Step 6: Initialize in App.jsx

```javascript
import PushNotificationService from './src/services/PushNotificationService';
import messaging from '@react-native-firebase/messaging';

// In your App component, after login:
useEffect(() => {
  if (profileData?.customerId) {
    // Request permission and register token
    PushNotificationService.requestPermissionAndGetToken(profileData.customerId);
    
    // Setup notification handlers
    PushNotificationService.setupNotificationHandlers();
  }
}, [profileData?.customerId]);
```

## Sending Push Notifications from Backend

### Option 1: Using Firebase Admin SDK (Recommended)

1. **Install Firebase Admin SDK:**
```bash
pip install firebase-admin
```

2. **Create service file:** `backend/firebase_service.py`
```python
import firebase_admin
from firebase_admin import credentials, messaging
import os

# Initialize Firebase Admin (only once)
def initialize_firebase():
    if not firebase_admin._apps:
        # Download service account key from Firebase Console
        # Project Settings → Service Accounts → Generate New Private Key
        cred_path = os.getenv('FIREBASE_CREDENTIALS_PATH', 'path/to/serviceAccountKey.json')
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)

def send_push_notification(customer_id, title, body, data=None):
    """
    Send push notification to a customer.
    
    Args:
        customer_id: Customer ID
        title: Notification title
        body: Notification body
        data: Optional data payload (dict)
    """
    try:
        initialize_firebase()
        
        # Get device tokens for customer
        tokens_query = """
            SELECT device_token FROM device_tokens 
            WHERE customer_id = %s
        """
        tokens_result = db.execute_query(tokens_query, (customer_id,))
        
        if not tokens_result:
            print(f"No device tokens found for customer {customer_id}")
            return False
        
        device_tokens = [row['device_token'] for row in tokens_result]
        
        # Create message
        message = messaging.MulticastMessage(
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
            data=data or {},
            tokens=device_tokens,
        )
        
        # Send
        response = messaging.send_multicast(message)
        print(f"✅ Successfully sent {response.success_count} notifications")
        return True
        
    except Exception as e:
        print(f"❌ Error sending push notification: {e}")
        return False
```

3. **Use in your code:**
```python
from firebase_service import send_push_notification

# Example: Send notification when customer is approved
if status == 'APPROVED':
    send_push_notification(
        customer_id=customer_id,
        title="Account Approved!",
        body=f"Great news, {customer_name}! Your account has been approved.",
        data={'type': 'approval', 'customerId': customer_id}
    )
```

### Option 2: Using FCM REST API

You can also use FCM REST API directly with HTTP requests (similar to PRP SMS API).

## Testing

1. **Test device token registration:**
```bash
curl -X POST http://localhost:5000/api/notifications/register-device \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "1001",
    "deviceToken": "test_token_123",
    "platform": "android"
  }'
```

2. **Test notifications API:**
```bash
curl http://localhost:5000/api/notifications?customerId=1001
```

## Notes

- **No Notifications Table:** Notifications are generated dynamically from customer data
- **Device Tokens Table:** Auto-created when first token is registered (minimal storage)
- **Push Notifications:** Require Firebase setup and device token registration
- **Foreground/Background:** Handled automatically by React Native Firebase

## Next Steps

1. ✅ Backend API is ready
2. ⏳ Install React Native Firebase packages
3. ⏳ Configure Firebase project
4. ⏳ Implement token registration in app
5. ⏳ Test push notifications

