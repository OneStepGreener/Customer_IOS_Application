# Session Management Implementation

## Overview
Session management using AsyncStorage (local storage) to persist user sessions across app restarts. Sessions are stored locally on the device, **NOT in the database**.

## Features

### ✅ Session Storage
- Sessions stored in AsyncStorage (persists across app restarts)
- Session expiration: **1 month (30 days)** from creation
- **Automatic logout after 1 month** - Users are automatically logged out when session expires
- Automatic session validation on app startup

### ✅ Auto-Login
- App checks for existing session on startup
- If session exists and is valid → Auto-login to Dashboard
- If no session → Normal flow (Splash → Onboarding → Login)

### ✅ Logout
- Clears session from AsyncStorage
- Calls logout API for logging purposes
- Resets all app state
- Navigates to Login screen

## Implementation Details

### Backend API (`backend/app.py`)

**POST `/api/logout`**
- Endpoint for logout logging
- Sessions are NOT stored in database
- Used for analytics/logging purposes only
- Always returns success

### Frontend Services

**`src/services/SessionService.js`**
- `createSession()` - Create and store session after login
- `getSession()` - Retrieve current session
- `clearSession()` - Clear session on logout
- `updateSession()` - Update session after profile edit
- `isLoggedIn()` - Check if user has active session
- `refreshSession()` - Extend session expiration

### App Flow

**Login Flow:**
```
User enters OTP → OTP verified → 
  → Create session in AsyncStorage → 
  → Navigate to Dashboard
```

**App Startup Flow:**
```
App starts → Check AsyncStorage for session →
  → If session exists and valid (not expired) → Restore user state → Navigate to Dashboard
  → If session expired (1 month passed) → Auto-logout → Clear session → Show Login
  → If no session → Show Splash → Onboarding → Login
```

**Logout Flow:**
```
User clicks Logout → Confirm → 
  → Call logout API → 
  → Clear AsyncStorage → 
  → Reset app state → 
  → Navigate to Login
```

## Session Data Structure

```javascript
{
  token: "session_1001_1234567890",
  customerId: "1001",
  customerName: "John Doe",
  email: "john@example.com",
  mobileNumber: "9876543210",
  address: "123 Main St",
  city: "Mumbai",
  state: "Maharashtra",
  userType: "RESIDENTIAL",
  status: "APPROVED",
  createdAt: "2024-01-01T00:00:00.000Z",
  expiresAt: "2024-01-31T00:00:00.000Z"  // 30 days = 1 month
}
```

## Automatic Logout After 1 Month

**Important**: Sessions automatically expire after **1 month (30 days)**. When a user opens the app after 1 month:
- Session is automatically cleared from AsyncStorage
- User is automatically logged out
- User is redirected to Login screen
- All session data is removed

## Key Features

1. **Persistence**: Sessions survive app restarts, device reboots, and app removal from recent apps
2. **Auto-Login**: Users stay logged in even after closing the app (until expiration)
3. **Session Expiration**: Sessions expire after **1 month (30 days)** - **AUTOMATIC LOGOUT**
4. **Auto-Logout**: Users are automatically logged out when session expires (1 month limit)
5. **Profile Sync**: Session updates when profile is edited
6. **Secure**: Session tokens are device-specific

## Usage

### Creating Session (After Login)
```javascript
await SessionService.createSession(customerData);
```

### Checking Session (On App Start)
```javascript
const session = await SessionService.getSession();
if (session) {
  // User is logged in, restore state
}
```

### Clearing Session (On Logout)
```javascript
await SessionService.clearSession();
```

### Updating Session (After Profile Edit)
```javascript
await SessionService.updateSession({
  customerName: 'New Name',
  email: 'new@email.com'
});
```

## Notes

- **Sessions are local only** - Not stored in database
- **Session expiration** - 30 days from creation
- **Auto-refresh** - Can be implemented to refresh session on app use
- **Security** - Session tokens are device-specific and not validated server-side

## Testing

1. **Test Auto-Login:**
   - Login to app
   - Close app completely
   - Reopen app
   - Should automatically log in to Dashboard

2. **Test Logout:**
   - Click logout in Profile screen
   - Confirm logout
   - Should navigate to Login screen
   - Session should be cleared

3. **Test Session Persistence:**
   - Login to app
   - Remove app from recent apps
   - Reopen app
   - Should still be logged in

