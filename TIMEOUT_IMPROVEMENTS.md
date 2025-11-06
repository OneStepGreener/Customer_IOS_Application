# API Timeout Improvements

## Summary
Increased timeout values for all API calls in both backend and frontend to handle slow network connections and slow SMS delivery.

## Backend Changes (`backend/app.py`)

### PRP SMS API Timeout
- **Before**: 3 seconds
- **After**: 30 seconds
- **Affected Endpoints**:
  - `/api/login/generate-otp`
  - `/api/login/resend-otp`

**Why**: SMS delivery can be slow, especially in India. 30 seconds gives enough time for the PRP API to process and send the SMS.

## Frontend Changes

### Created New Utility (`src/utils/apiHelper.js`)
- Added `fetchWithTimeout()` function
- Default timeout: **60 seconds**
- Supports custom timeout per API call
- Properly handles timeout errors

### Updated API Calls with 60-Second Timeout

1. **LoginScreen.jsx**:
   - `POST /api/login/generate-otp` - 60 seconds

2. **OTPScreen.jsx**:
   - `POST /api/login/verify-otp` - 60 seconds
   - `POST /api/login/resend-otp` - 60 seconds

3. **SignupScreen.jsx**:
   - `POST /api/signup` - 60 seconds
   - Google Maps Geocoding API - 30 seconds

4. **NotificationScreen.jsx**:
   - `GET /api/notifications` - 60 seconds
   - `POST /api/notifications/mark-read` - 60 seconds (both instances)

5. **PushNotificationService.js**:
   - `POST /api/notifications/register-device` - 60 seconds

## Timeout Values

| API Type | Timeout | Reason |
|----------|---------|--------|
| OTP Generation | 60s | SMS delivery can be slow |
| OTP Verification | 60s | Database queries |
| Signup | 60s | Database insert operations |
| Profile Edit | 60s | Database update operations |
| Notifications | 60s | Database queries |
| Google Maps API | 30s | External API, faster response |
| PRP SMS API | 30s | SMS gateway, can be slow |

## Benefits

1. **Better User Experience**: No premature timeouts on slow networks
2. **Handles Slow SMS**: PRP API can take time to deliver SMS
3. **Consistent Timeouts**: All APIs use reasonable timeout values
4. **Error Handling**: Proper timeout error messages

## Testing

After these changes:
- OTP generation should work even on slow networks
- Users won't see timeout errors prematurely
- SMS delivery issues won't cause API failures

## Notes

- Default browser/fetch timeout is usually 30-60 seconds
- React Native fetch timeout is unlimited by default, but we set explicit timeouts
- Timeouts can be adjusted per API if needed
- For production, consider using shorter timeouts and retry logic

