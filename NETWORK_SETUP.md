# Network Setup Guide for OTP Testing

## Common Issue: "Network request failed"

This error occurs when the React Native app cannot reach the Flask backend.

## Solutions:

### 1. For iOS Simulator (Mac)
- Use: `http://localhost:5000`
- ✅ Should work out of the box

### 2. For Android Emulator
- Use: `http://10.0.2.2:5000`
- ✅ Special IP that maps to host machine's localhost

### 3. For Physical Device (iPhone/Android)
- **You MUST use your computer's IP address, NOT localhost**
- Find your computer's IP:
  ```bash
  # Mac/Linux:
  ifconfig | grep "inet " | grep -v 127.0.0.1
  
  # Windows:
  ipconfig
  ```
- Example IP: `192.168.1.100`
- Update API_BASE_URL to: `http://192.168.1.100:5000`

### 4. Make sure Flask server is running:
```bash
cd backend
source venv/bin/activate
python3 app.py
```

### 5. Check firewall:
- Make sure port 5000 is not blocked
- On Mac: System Settings → Firewall → Allow incoming connections

### 6. Verify backend is accessible:
```bash
# From your computer:
curl http://localhost:5000/health

# From your phone (same WiFi), open browser:
http://YOUR_COMPUTER_IP:5000/health
```

## Quick Fix:

1. Get your computer's IP address
2. Update `API_BASE_URL` in:
   - `src/screens/OTP/OTPScreen.jsx`
   - `src/screens/Login/LoginScreen.jsx`
   - `src/screens/Signup/SignupScreen.jsx`
3. Replace `localhost` with your IP (e.g., `192.168.1.100`)
4. Restart your React Native app
5. Make sure Flask server is running
