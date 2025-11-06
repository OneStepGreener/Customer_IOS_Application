# Simulator Testing Guide for OTP API

## Network Error on Simulator - Solutions

### For iOS Simulator (Mac)
✅ **Use:** `http://localhost:5000`
- This should work automatically
- No special configuration needed

### For Android Emulator
❌ **Don't use:** `http://localhost:5000` (won't work)
✅ **Use:** `http://10.0.2.2:5000`
- `10.0.2.2` is a special IP that maps to the host machine's localhost
- Android emulator can't access `localhost` directly

## Quick Fix Steps:

### 1. Identify Your Simulator
- **iOS Simulator:** Use `localhost:5000` ✅
- **Android Emulator:** Use `10.0.2.2:5000` ✅

### 2. Update API_BASE_URL

**For iOS Simulator:**
```javascript
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5000'
  : 'https://your-production-url.com';
```

**For Android Emulator:**
```javascript
const API_BASE_URL = __DEV__ 
  ? 'http://10.0.2.2:5000'  // Android emulator special IP
  : 'https://your-production-url.com';
```

### 3. Update Files:
- `src/screens/OTP/OTPScreen.jsx`
- `src/screens/Login/LoginScreen.jsx` (if it has API_BASE_URL)
- `src/screens/Signup/SignupScreen.jsx` (if it has API_BASE_URL)

### 4. Start Flask Server:
```bash
cd backend
source venv/bin/activate
python3 app.py
```

### 5. Verify Flask is Running:
```bash
# Test from terminal:
curl http://localhost:5000/health

# Should return:
# {"status":"healthy","message":"Flask backend is running"}
```

### 6. Restart React Native App:
- Stop the app completely
- Restart to load new API_BASE_URL

## Troubleshooting:

### Still Getting Network Error?

1. **Check Flask Server:**
   ```bash
   # Should see:
   # Running on http://127.0.0.1:5000
   # Or: Running on http://0.0.0.0:5000
   ```

2. **Test from Simulator:**
   - iOS Simulator: Open Safari, go to `http://localhost:5000/health`
   - Android Emulator: Open Chrome, go to `http://10.0.2.2:5000/health`

3. **Check Firewall:**
   - Mac: System Settings → Firewall → Allow Python/Flask

4. **Verify API_BASE_URL:**
   - Add console.log to see what URL is being used:
   ```javascript
   console.log('API_BASE_URL:', API_BASE_URL);
   ```

5. **Common Mistakes:**
   - ❌ Using `localhost` on Android Emulator
   - ❌ Flask server not running
   - ❌ Wrong port (should be 5000)
   - ❌ Typo in URL (http vs https, extra slashes)
