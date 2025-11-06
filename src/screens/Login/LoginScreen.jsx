import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import CustomStatusBar, { getStatusBarHeight } from '../../components/CustomStatusBar';

const { width, height } = Dimensions.get('window');

// API Base URL - Update with your backend server URL
// For iOS Simulator: 'http://localhost:5000'
// For Android Emulator: 'http://10.0.2.2:5000'
// For Physical Device: 'http://YOUR_COMPUTER_IP:5000'
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5000'  // ✅ For iOS Simulator - use localhost
  : 'https://your-production-url.com';  // Production URL

const LoginScreen = ({ onBack, onGenerateOTP, onNext, onNavigateToSignup }) => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [isGeneratingOTP, setIsGeneratingOTP] = useState(false);

  const validateMobileNumber = (number) => {
    const cleanNumber = number.replace(/\D/g, ''); // Remove non-digits
    if (cleanNumber.length === 0) {
      setMobileError('');
    } else if (cleanNumber.length < 10) {
      setMobileError('Mobile number must be 10 digits');
    } else if (cleanNumber.length > 10) {
      setMobileError('Mobile number cannot exceed 10 digits');
    } else {
      setMobileError('');
    }
    return cleanNumber;
  };

  const handleMobileNumberChange = (text) => {
    const cleanNumber = validateMobileNumber(text);
    setMobileNumber(cleanNumber);
  };

  const handleGenerateOTP = async () => {
    if (mobileNumber.length !== 10) {
      setMobileError('Please enter a valid 10-digit mobile number');
      return;
    }

    // Prevent multiple simultaneous API calls
    if (isGeneratingOTP) {
      console.log('⚠️ LoginScreen: OTP generation already in progress, ignoring duplicate call');
      return;
    }

    setIsGeneratingOTP(true);
    setMobileError('');

    try {
      console.log('🔵 LoginScreen: ========================================');
      console.log('🔵 LoginScreen: Generate OTP Button Clicked');
      console.log('🔵 LoginScreen: Mobile Number:', mobileNumber);
      console.log('🔵 LoginScreen: API URL:', `${API_BASE_URL}/api/login/generate-otp`);
      console.log('🔵 LoginScreen: Calling API...');
      console.log('🔵 LoginScreen: ========================================');
      
      const response = await fetch(`${API_BASE_URL}/api/login/generate-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mobileNumber: mobileNumber,
        }),
      });

      console.log('🔵 LoginScreen: Response received');
      console.log('🔵 LoginScreen: Response status:', response.status);
      console.log('🔵 LoginScreen: Response headers:', JSON.stringify(Object.fromEntries(response.headers.entries())));

      const result = await response.json();
      console.log('🔵 LoginScreen: Response data:', JSON.stringify(result, null, 2));

      if (response.ok && result.status === 'success') {
        // OTP generated successfully - navigate to OTPScreen
        console.log('✅ LoginScreen: OTP generated successfully');
        
        // Log OTP if returned in response (for testing/debugging)
        if (result.data && result.data.otp) {
          console.log('🔑 LoginScreen: Generated OTP:', result.data.otp);
          console.log('📱 LoginScreen: SMS sent:', result.data.smsSent);
          
          // Show OTP in alert if SMS might not have been sent
          if (!result.data.smsSent) {
            Alert.alert(
              'OTP Generated',
              `Your OTP is: ${result.data.otp}\n\nPlease use this OTP to verify.\n(Valid for 5 minutes)`,
              [
                {
                  text: 'OK',
                  onPress: () => {
                    if (onGenerateOTP) {
                      onGenerateOTP(mobileNumber);
                    }
                  },
                },
              ]
            );
            return; // Don't navigate immediately, wait for user to acknowledge
          }
        }
        
        // Navigate to OTPScreen
        if (onGenerateOTP) {
          onGenerateOTP(mobileNumber);
        }
      } else {
        // Handle error
        let errorMessage = result.message || 'Failed to generate OTP. Please try again.';
        
        if (result.errorCode === 'MOBILE_NOT_FOUND' || result.redirectToSignup) {
          // Mobile number not registered - show signup option
          Alert.alert(
            'Not Registered',
            errorMessage,
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Sign Up',
                onPress: () => {
                  if (onNavigateToSignup) {
                    onNavigateToSignup();
                  }
                },
              },
            ]
          );
        } else {
          // Other error (e.g., profile under consideration)
          Alert.alert(
            'Error',
            errorMessage,
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('❌ LoginScreen: Generate OTP error:', error);
      Alert.alert(
        'Network Error',
        'Unable to connect to server. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsGeneratingOTP(false);
    }
  };

  const getButtonStyle = () => {
    return {
      ...styles.generateOTPButton,
      backgroundColor: mobileNumber.length !== 10 ? '#CCCCCC' : undefined,
    };
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomStatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      
      {/* Content Section */}
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo Header Section */}
          <View style={styles.logoHeader}>
            <Image 
              source={require('../../assets/images/onestepgreener-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.content}>
            <Text style={styles.instructionText}>
            Enter the registered phone number for OTP
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mobile Number</Text>
              <View style={styles.phoneInputContainer}>
                <View style={styles.countryCodeContainer}>
                  <Text style={styles.countryCode}>+91</Text>
                </View>
                <TextInput
                  style={[styles.input, mobileError ? styles.inputError : null]}
                  value={mobileNumber}
                  onChangeText={handleMobileNumberChange}
                  placeholder="Enter 10-digit mobile number"
                  keyboardType="phone-pad"
                  placeholderTextColor="#999999"
                  maxLength={10}
                />
              </View>
              {mobileError ? (
                <Text style={styles.errorText}>{mobileError}</Text>
              ) : null}
            </View>

            <TouchableOpacity 
              style={{
                borderRadius: Math.max(width * 0.02, 8),
                paddingVertical: Math.max(height * 0.015, 12),
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: Math.max(height * 0.015, 12),
                minHeight: Math.max(height * 0.05, 45),
                alignSelf: 'center',
                width: Math.max(width * 0.4, 150),
                backgroundColor: (mobileNumber.length === 10 && !isGeneratingOTP) ? '#1B5E20' : 'rgba(27, 94, 32, 0.3)',
                borderWidth: 1,
                borderColor: (mobileNumber.length === 10 && !isGeneratingOTP) ? '#1B5E20' : 'rgba(27, 94, 32, 0.5)',
              }}
              onPress={handleGenerateOTP}
              disabled={mobileNumber.length !== 10 || isGeneratingOTP}
            >
              <Text style={[styles.generateOTPButtonText, { color: (mobileNumber.length === 10 && !isGeneratingOTP) ? '#FFFFFF' : '#1B5E20' }]}>
                {isGeneratingOTP ? 'Sending OTP...' : 'Generate OTP'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sign up text at bottom */}
          <View style={styles.signInContainer}>
            <View style={styles.signInTextContainer}>
              <Text style={styles.signInText}>Don't have an account?</Text>
              <TouchableOpacity onPress={onNavigateToSignup} style={styles.signUpButton}>
                <Text style={styles.signUpLink}>Sign up</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.bottomSpacer} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  logoHeader: {
    backgroundColor: '#FFFFFF',
    paddingTop: getStatusBarHeight() + Math.max(height * 0.04, 30),
    paddingBottom: Math.max(height * 0.04, 30),
    paddingHorizontal: Math.max(width * 0.02, 10),
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: Math.max(height * 0.18, 100),
  },
  logo: {
    width: Math.max(Math.min(width * 0.85, 400), 300),
    height: Math.max(Math.min(height * 0.2, 120), 90),
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Math.max(height * 0.05, 30),
  },
  content: {
    flex: 1,
    flexGrow: 1, // Ensures content grows to fill available space
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: Math.max(width * 0.08, 25),
    borderTopRightRadius: Math.max(width * 0.08, 25),
    paddingHorizontal: Math.max(width * 0.04, 16),
    paddingTop: Math.max(height * 0.035, 25),
    paddingBottom: Math.max(height * 0.02, 10), // Adjust as needed
    marginBottom: -20, // Make sure there's no margin limiting the bottom
  },
  instructionText: {
    fontSize: Math.max(Math.min(width * 0.035, 18), 14),
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: Math.max(height * 0.08, 60),
    lineHeight: Math.max(Math.min(width * 0.04, 22), 18),
    paddingHorizontal: Math.max(width * 0.02, 10),
  },
  inputGroup: {
    marginBottom: Math.max(height * 0.035, 25),
  },
  label: {
    fontSize: Math.max(Math.min(width * 0.04, 20), 16),
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: Math.max(height * 0.015, 12),
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
    borderRadius: Math.max(width * 0.06, 25),
    borderWidth: 1,
    borderColor: 'rgba(46, 125, 50, 0.3)',
    overflow: 'hidden',
  },
  countryCodeContainer: {
    backgroundColor: 'rgba(46, 125, 50, 0.2)',
    paddingHorizontal: Math.max(width * 0.03, 12),
    paddingVertical: Math.max(height * 0.018, 15),
    borderRightWidth: 1,
    borderRightColor: 'rgba(46, 125, 50, 0.3)',
  },
  countryCode: {
    fontSize: Math.max(Math.min(width * 0.035, 18), 14),
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  input: {
    flex: 1,
    borderWidth: 0,
    borderRadius: 0,
    paddingHorizontal: Math.max(width * 0.035, 14),
    paddingVertical: Math.max(height * 0.018, 15),
    fontSize: Math.max(Math.min(width * 0.035, 18), 14),
    backgroundColor: 'transparent',
    color: '#2E7D32',
    minHeight: Math.max(height * 0.06, 50),
  },
  inputError: {
    borderColor: '#FF6B6B',
    borderWidth: 2,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: Math.max(Math.min(width * 0.03, 14), 12),
    marginTop: Math.max(height * 0.008, 6),
    marginLeft: Math.max(width * 0.01, 4),
  },

  generateOTPButtonText: {
    color: '#FFFFFF',
    fontSize: Math.max(Math.min(width * 0.035, 18), 14),
    fontWeight: 'bold',
  },
  signInContainer: {
    alignItems: 'center',
    paddingVertical: Math.max(height * 0.04, 80),
    paddingHorizontal: Math.max(width * 0.04, 16),
    backgroundColor: '#FFFFFF',
    marginTop: Math.max(height * 0.02, 15),
  },
  bottomSpacer: {
    height: Math.max(height * 0.15, 100),
  },
  signInTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  signInText: {
    fontSize: Math.max(Math.min(width * 0.035, 18), 14),
    color: '#666666',
    textAlign: 'center',
    lineHeight: Math.max(Math.min(width * 0.04, 22), 18),
    marginRight: 5,
  },
  signUpButton: {
    paddingHorizontal: Math.max(width * 0.02, 8),
    paddingVertical: Math.max(height * 0.005, 4),
    borderRadius: Math.max(width * 0.015, 6),
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(46, 125, 50, 0.3)',
  },
  signUpLink: {
    fontSize: Math.max(Math.min(width * 0.035, 18), 14),
    fontWeight: 'bold',
    color: '#2E7D32',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
