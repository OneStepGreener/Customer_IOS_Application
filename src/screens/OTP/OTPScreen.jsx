import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import CustomStatusBar, { getStatusBarHeight } from '../../components/CustomStatusBar';
import { fetchWithTimeout } from '../../utils/apiHelper';

const { width, height } = Dimensions.get('window');

// API Base URL - Update with your backend server URL
// For physical device testing, replace 'localhost' with your computer's IP address
// Example: 'http://192.168.1.100:5000'
// For iOS Simulator, use 'http://localhost:5000'
// For Android Emulator, use 'http://10.0.2.2:5000'
// For physical device, use your computer's IP: 'http://192.168.x.x:5000'
// API Base URL Configuration:
// For iOS Simulator: 'http://localhost:5000'
// For Android Emulator: 'http://10.0.2.2:5000'
// For Physical Device: 'http://YOUR_COMPUTER_IP:5000' (e.g., 'http://192.168.1.100:5000')
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5000'  // ✅ For iOS Simulator - use localhost
  : 'https://your-production-url.com';  // Production URL

const OTPScreen = ({ mobileNumber, onBack, onAccept, onSendAgain, onReEnterMobile, onNavigateToSignup }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [userStartedTyping, setUserStartedTyping] = useState(false);
  const [timer, setTimer] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef([]);

  const handleOtpChange = (text, index) => {
    // Only allow single digit
    const sanitizedText = text.replace(/[^0-9]/g, '').slice(0, 1);
    
    const newOtp = [...otp];
    newOtp[index] = sanitizedText;
    setOtp(newOtp);
    
    // Mark that user has started typing manually
    if (sanitizedText && !userStartedTyping) {
      setUserStartedTyping(true);
    }

    // Auto-focus next input if there's text and not at the last input
    if (sanitizedText && index < 5) {
      setTimeout(() => {
        if (inputRefs.current[index + 1]) {
          inputRefs.current[index + 1].focus();
        }
      }, 100);
    }
    
    // Check if OTP is complete
    const updatedOtp = [...newOtp];
    if (updatedOtp.every(digit => digit !== '')) {
      // Don't blur inputs - let user see the complete OTP
      // Just enable the accept button
    }
  };

  const handleKeyPress = (e, index) => {
    // Move to previous input on backspace
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      requestAnimationFrame(() => {
        if (inputRefs.current[index - 1]) {
          inputRefs.current[index - 1].focus();
        }
      });
    }
  };

  const handleInputFocus = (index) => {
    setFocusedIndex(index);
  };

  const handleInputBlur = (index) => {
    setFocusedIndex(-1);
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  // Resend OTP function - uses dedicated resend-otp endpoint
  const resendOTP = React.useCallback(async (mobileNum) => {
    try {
      console.log('🔄 Resending OTP for:', mobileNum);
      console.log('🔄 API URL:', `${API_BASE_URL}/api/login/resend-otp`);
      
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/api/login/resend-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mobileNumber: mobileNum,
          }),
        },
        60000 // 60 seconds timeout
      );
      
      console.log('🔄 Response status:', response.status);

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        // OTP resent successfully, SMS sent
        console.log('New OTP sent to', mobileNum);
        Alert.alert(
          'Success',
          result.message || 'New OTP sent successfully to your mobile number',
          [{ text: 'OK' }]
        );
      } else {
        // Handle error - show alert
        let errorMessage = result.message || 'Failed to resend OTP. Please try again.';
        
        if (result.errorCode === 'MOBILE_NOT_FOUND' || result.redirectToSignup) {
          errorMessage = 'Mobile number not registered. Please sign up first.';
        } else if (errorMessage.toLowerCase().includes('under consideration')) {
          errorMessage = 'Your profile is under consideration. Please wait for approval.';
        }
        
        Alert.alert(
          'Error',
          errorMessage,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      Alert.alert(
        'Network Error',
        'Unable to connect to server. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    }
  }, []);

  // Track if OTP has been generated to prevent duplicate calls
  const otpGeneratedRef = React.useRef(false);

  // Auto-generate OTP when component mounts with mobileNumber (only once)
  useEffect(() => {
    // Only generate if mobileNumber exists and OTP hasn't been generated yet
    if (mobileNumber && !otpGeneratedRef.current) {
      otpGeneratedRef.current = true;
      // OTP should already be generated in LoginScreen, so we skip auto-generation
      // This prevents duplicate API calls
      console.log('📱 OTPScreen: OTP should already be generated from LoginScreen');
    }
  }, [mobileNumber]);

  const handleAccept = async () => {
    if (!isOtpComplete || isVerifying || !mobileNumber) {
      return;
    }

    setIsVerifying(true);
    const otpString = otp.join('');

    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/api/login/verify-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mobileNumber: mobileNumber,
            otp: otpString,
          }),
        },
        60000 // 60 seconds timeout
      );

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        // Check if user exists in database
        const userExists = result.userExists === true;
        const userApproved = result.userApproved === true;
        
        if (userExists && userApproved) {
          // User exists and is approved - navigate to Dashboard
          Alert.alert(
            'Success',
            result.message || 'Login successful!',
            [
              {
                text: 'OK',
                onPress: () => {
                  // Pass customer data to onAccept for Dashboard
                  if (onAccept) {
                    onAccept(result.data);
                  }
                },
              },
            ]
          );
        } else if (userExists && !userApproved) {
          // User exists but not approved - show message and navigate to Dashboard anyway
          Alert.alert(
            'Profile Under Consideration',
            'Your profile is under consideration. Please wait for approval.',
            [
              {
                text: 'OK',
                onPress: () => {
                  // Pass customer data to onAccept for Dashboard
                  if (onAccept) {
                    onAccept(result.data);
                  }
                },
              },
            ]
          );
        } else {
          // User does NOT exist - navigate to SignupScreen
          Alert.alert(
            'New User',
            'Mobile number not registered. Please sign up to continue.',
            [
              {
                text: 'OK',
                onPress: () => {
                  // Navigate to signup - pass mobile number
                  if (onNavigateToSignup) {
                    onNavigateToSignup(mobileNumber);
                  }
                },
              },
            ]
          );
        }
      } else {
        // Handle specific error messages from backend
        let errorMessage = result.message || 'Invalid OTP. Please try again.';
        
        // Handle expired OTP
        if (errorMessage.toLowerCase().includes('expired')) {
          errorMessage = 'OTP has expired. Please request a new one.';
        } else if (errorMessage.toLowerCase().includes('not found')) {
          errorMessage = 'OTP not found. Please request a new OTP.';
        }
        
        Alert.alert(
          'Verification Failed',
          errorMessage,
          [{ text: 'OK' }]
        );
        // Reset OTP on failure
        setOtp(['', '', '', '', '', '']);
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      Alert.alert(
        'Network Error',
        'Unable to connect to server. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsVerifying(false);
    }
  };

  // Removed duplicate useEffect - OTP is already generated in LoginScreen

  // Initial setup - focus first input after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  // Timer functionality
  useEffect(() => {
    let interval = null;
    
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(prevTimer => {
          if (prevTimer <= 1) {
            setIsTimerActive(false);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTimerActive, timer]);

  const handleSendAgain = async () => {
    if (!mobileNumber || isResending) {
      return;
    }

    setIsResending(true);
    
    // Reset OTP and timer
    setOtp(['', '', '', '', '', '']);
    setUserStartedTyping(false);
    setTimer(60);
    setIsTimerActive(true);
    otpGeneratedRef.current = false; // Reset flag for resend
    
    // Resend new OTP via dedicated resend-otp API endpoint
    console.log('🔄 OTPScreen: Resending OTP via resend-otp endpoint...');
    await resendOTP(mobileNumber);
    otpGeneratedRef.current = true;
    
    setIsResending(false);
    
    // Clear any existing focus
    inputRefs.current.forEach(ref => {
      if (ref) {
        ref.blur();
      }
    });
    
    // Focus first input after clearing
    setTimeout(() => {
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }, 100);
  };



  return (
    <View style={styles.container}>
      <CustomStatusBar backgroundColor="#008052" barStyle="light-content" />
      
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Enter OTP</Text>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Timer Display */}
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>
            {isTimerActive ? `${timer}s` : ''}
          </Text>
        </View>

        {/* OTP Input Fields */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => inputRefs.current[index] = ref}
              style={[
                styles.otpInput,
                focusedIndex === index && styles.otpInputFocused,
                digit && styles.otpInputFilled
              ]}
              value={digit}
              onChangeText={(text) => handleOtpChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              onFocus={() => handleInputFocus(index)}
              onBlur={() => handleInputBlur(index)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              placeholder=""
              placeholderTextColor="#999999"
              autoCorrect={false}
              autoCapitalize="none"

            />
          ))}
        </View>

        {/* Accept Button */}
        <TouchableOpacity 
          style={[
            styles.acceptButton,
            { backgroundColor: (isOtpComplete && !isVerifying) ? '#2E7D32' : '#CCCCCC' }
          ]}
          onPress={handleAccept}
          disabled={!isOtpComplete || isVerifying}
        >
          <Text style={styles.acceptButtonText}>
            {isVerifying ? 'Verifying...' : 'Accept'}
          </Text>
        </TouchableOpacity>

        {/* Resend OTP Text - Only show when timer expires */}
        {!isTimerActive && (
          <TouchableOpacity 
            style={styles.resendOTPContainer}
            onPress={handleSendAgain}
            disabled={isResending}
          >
            <Text style={styles.resendOTPText}>
              {isResending ? 'Sending...' : 'Resend OTP'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Re-enter Mobile Number Link */}
        <View style={styles.reEnterContainer}>
          <Text style={styles.notSureText}>Wrong number? </Text>
          <TouchableOpacity onPress={onReEnterMobile}>
            <Text style={styles.reEnterLink}>Change your mobile number</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#008052',
  },
  header: {
    backgroundColor: '#008052',
    paddingTop: getStatusBarHeight() + Math.max(height * 0.04, 30),
    paddingBottom: Math.max(height * 0.04, 30),
    paddingHorizontal: Math.max(width * 0.04, 16),
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: Math.max(height * 0.25, 150),
  },
  headerTitle: {
    fontSize: Math.max(Math.min(width * 0.09, 42), 28),
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: Math.max(Math.min(width * 0.1, 48), 32),
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: Math.max(width * 0.08, 25),
    borderTopRightRadius: Math.max(width * 0.08, 25),
    paddingHorizontal: Math.max(width * 0.04, 16),
    paddingBottom: Math.max(height * 0.08, 60),
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
  },

  timerContainer: {
    alignItems: 'center',
    marginTop: Math.max(height * 0.04, 30),
    marginBottom: Math.max(height * 0.04, 30),
  },
  timerText: {
    fontSize: Math.max(Math.min(width * 0.035, 18), 14),
    color: '#2E7D32',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Math.max(height * 0.06, 45),
    paddingHorizontal: Math.max(width * 0.02, 10),
    gap: Math.max(width * 0.015, 12),
    width: '100%',
  },
  otpInput: {
    width: Math.max(Math.min(width * 0.08, 45), 40),
    height: Math.max(Math.min(width * 0.08, 45), 40),
    borderRadius: Math.max(Math.min(width * 0.04, 20), 18),
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    fontSize: Math.max(Math.min(width * 0.04, 20), 16),
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    textAlignVertical: 'center',
    paddingVertical: 0,
    paddingHorizontal: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  otpInputFocused: {
    borderColor: '#2E7D32',
    borderWidth: 2,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  otpInputFilled: {
    borderColor: '#2E7D32',
    backgroundColor: '#F1F8E9',
  },
  acceptButton: {
    borderRadius: Math.max(width * 0.06, 25),
    paddingVertical: Math.max(height * 0.015, 12),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Math.max(height * 0.03, 25),
    minHeight: Math.max(height * 0.05, 45),
    marginHorizontal: Math.max(width * 0.02, 10),
    alignSelf: 'center',
    width: Math.max(width * 0.4, 150),
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: Math.max(Math.min(width * 0.04, 20), 16),
    fontWeight: 'bold',
  },
  resendOTPContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Math.max(height * 0.02, 15),
    alignSelf: 'center',
  },
  resendOTPText: {
    color: '#2E7D32',
    fontSize: Math.max(Math.min(width * 0.04, 20), 16),
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  reEnterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: Math.max(height * 0.08, 100),
    left: 0,
    right: 0,
    paddingHorizontal: Math.max(width * 0.04, 16),
  },
  notSureText: {
    fontSize: Math.max(Math.min(width * 0.035, 18), 14),
    color: '#666666',
    fontWeight: '500',
    textAlign: 'center',
  },
  reEnterLink: {
    color: '#2E7D32',
    fontWeight: 'bold',
    fontSize: Math.max(Math.min(width * 0.035, 18), 14),
    textAlign: 'center',
  },

});

export default OTPScreen;
