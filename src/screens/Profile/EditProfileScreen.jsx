import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  TextInput,
  Platform,
  ScrollView,
  Animated,
  Alert,
  ActivityIndicator,
} from 'react-native';
import BottomNavigation from '../../components/BottomNavigation';
import CustomStatusBar, { getStatusBarHeight } from '../../components/CustomStatusBar';
import { fetchWithTimeout } from '../../utils/apiHelper';
import SessionService from '../../services/SessionService';

const { width, height } = Dimensions.get('window');

// API Base URL
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5000'
  : 'https://your-production-url.com';

const EditProfileScreen = ({ onBack, onNavigateToDashboard, onNavigateToGift, onNavigateToCart, onNavigateToFAQ, onNavigateToClock, profileData, onUpdateProfile }) => {
  const [username, setUsername] = useState(profileData?.customerName || profileData?.username || 'John Smith');
  const [mobilePhone, setMobilePhone] = useState(profileData?.mobilePhone || '+44 555 5555 55');
  const [address, setAddress] = useState(profileData?.address || 'hno 2-250,');
  const [focusedInput, setFocusedInput] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Function to generate initials from username
  const generateInitials = (name) => {
    if (!name) return 'JS';
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    } else if (words.length === 1) {
      return words[0][0].toUpperCase();
    }
    return 'JS';
  };
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const profileImageScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(profileImageScale, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleUpdateProfile = async () => {
    if (!profileData?.customerId) {
      Alert.alert('Error', 'Customer ID not found. Please login again.');
      return;
    }

    if (isSubmitting) {
      return; // Prevent multiple submissions
    }

    setIsSubmitting(true);

    try {
      console.log('📤 Updating profile via API...');
      
      // Extract mobile number (remove +91 prefix if present)
      let mobileNumber = mobilePhone.replace(/^\+91/, '').replace(/\s/g, '').trim();
      
      // Prepare update payload
      const updatePayload = {
        customerId: profileData.customerId,
        fullName: username.trim(),
      };

      // Add mobile number if changed (but mobile number might not be editable)
      // Only include if it's different from the original
      if (mobileNumber && mobileNumber !== profileData.mobileNumber?.replace(/^\+91/, '').replace(/\s/g, '')) {
        // Note: Mobile number updates might require OTP verification
        // For now, we'll skip mobile number updates in profile edit
        console.log('⚠️ Mobile number changes require OTP verification. Skipping mobile update.');
      }

      // Add address if provided
      if (address && address.trim()) {
        updatePayload.address = address.trim();
      }

      // Call update profile API
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/api/profile/edit`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatePayload),
        },
        60000 // 60 seconds timeout
      );

      const result = await response.json();

      if (result.status === 'success' && response.ok) {
        console.log('✅ Profile updated successfully:', result.data);
        
        // Update session with new data
        if (result.data) {
          await SessionService.updateSession({
            customerName: result.data.customerName || username,
            email: result.data.email || profileData.email || '',
            address: result.data.address || address,
            city: result.data.city || profileData.city || '',
            state: result.data.state || profileData.state || '',
          });
        }

        // Create updated profile data for parent component
        const updatedData = {
          ...profileData,
          username: result.data.customerName || username,
          customerName: result.data.customerName || username,
          email: result.data.email || profileData.email || '',
          mobilePhone: result.data.mobileNumber ? `+91${result.data.mobileNumber}` : mobilePhone,
          address: result.data.address || address,
          city: result.data.city || profileData.city || '',
          state: result.data.state || profileData.state || '',
        };

        // Pass the updated data back to parent component
        if (onUpdateProfile) {
          onUpdateProfile(updatedData);
        }

        Alert.alert('Success', 'Profile updated successfully!');
      } else {
        throw new Error(result.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      
      let errorMessage = 'Failed to update profile. Please try again.';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.name === 'AbortError') {
        errorMessage = 'Request timeout. Please check your connection and try again.';
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <View style={styles.container}>
      <CustomStatusBar backgroundColor="#008052" barStyle="light-content" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Modern Header with 3D Effect */}
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.headerGradient} />
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Edit My Profile</Text>
          </View>
        </Animated.View>

        {/* Profile Image with 3D Effect */}
        <Animated.View 
          style={[
            styles.profileImageWrapper,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: profileImageScale }
              ]
            }
          ]}
        >
                     <View style={styles.profileImageContainer}>
             <View style={styles.profileImageGradient} />
             <View style={styles.profileImagePlaceholder}>
               <Text style={styles.profileImageText}>{generateInitials(username)}</Text>
             </View>
           </View>
        </Animated.View>

        {/* Profile Name */}
        <Animated.View 
          style={[
            styles.profileNameContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
                     <Text style={styles.profileName}>{username}</Text>
        </Animated.View>

        {/* Account Settings Section */}
        <View style={styles.contentWrapper}>
          <Animated.View 
            style={[
              styles.accountSettingsCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }]
              }
            ]}
          >
            <View style={styles.accountSettingsGradient} />
            <Text style={styles.sectionTitle}>Account Settings</Text>
            
            {/* Username Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Username</Text>
              <View style={[
                styles.inputWrapper,
                focusedInput === 'username' && styles.inputWrapperFocused
              ]}>
                <View style={styles.inputIconContainer}>
                  <Image 
                    source={require('../../assets/images/Profile.png')}
                    style={styles.userIconImage}
                    resizeMode="contain"
                    onError={(error) => console.log('User icon error:', error)}
                  />
                </View>
                <TextInput
                  style={styles.textInput}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Enter your username"
                  placeholderTextColor="rgba(0, 128, 82, 0.5)"
                  onFocus={() => setFocusedInput('username')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </View>

            {/* Mobile Phone Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Mobile Phone No.</Text>
              <View style={[
                styles.inputWrapper,
                focusedInput === 'mobilePhone' && styles.inputWrapperFocused
              ]}>
                <View style={styles.inputIconContainer}>
                  <Image 
                    source={require('../../assets/images/mobile.png')}
                    style={styles.mobileIconImage}
                    resizeMode="contain"
                    onError={(error) => console.log('Mobile icon error:', error)}
                  />
                </View>
                <TextInput
                  style={styles.textInput}
                  value={mobilePhone}
                  onChangeText={setMobilePhone}
                  placeholder="Enter your mobile number"
                  placeholderTextColor="rgba(0, 128, 82, 0.5)"
                  keyboardType="phone-pad"
                  onFocus={() => setFocusedInput('mobilePhone')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </View>

            {/* Address Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Address</Text>
              <View style={[
                styles.inputWrapper,
                focusedInput === 'address' && styles.inputWrapperFocused
              ]}>
                <View style={styles.inputIconContainer}>
                  <Image 
                    source={require('../../assets/images/location-pin.png')}
                    style={styles.inputIconImage}
                    resizeMode="contain"
                    onError={(error) => console.log('Location icon error:', error)}
                  />
                </View>
                <TextInput
                  style={styles.textInput}
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Enter your address"
                  placeholderTextColor="rgba(0, 128, 82, 0.5)"
                  multiline
                  numberOfLines={3}
                  onFocus={() => setFocusedInput('address')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </View>
          </Animated.View>

          {/* Update Profile Button */}
          <Animated.View 
            style={[
              styles.updateButtonContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }]
              }
            ]}
          >
            <TouchableOpacity 
              style={[
                styles.updateButton,
                isSubmitting && styles.updateButtonDisabled
              ]} 
              onPress={handleUpdateProfile}
              disabled={isSubmitting}
            >
              <View style={styles.updateButtonGradient} />
              {isSubmitting ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={styles.updateButtonText}>Updating...</Text>
                </View>
              ) : (
                <Text style={styles.updateButtonText}>Update Profile</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <BottomNavigation
        activeTab="profile"
        onDashboardPress={onNavigateToDashboard}
        onGiftPress={onNavigateToGift}
        onCartPress={onNavigateToCart}
        onFaqPress={onNavigateToFAQ}
        onClockPress={onNavigateToClock}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8F5',
  },
  
  scrollView: {
    flex: 1,
    backgroundColor: '#F0F8F5',
  },

  // Header with 3D Gradient
  header: {
    backgroundColor: '#008052',
    paddingTop: getStatusBarHeight() + Math.max(height * 0.02, 15),
    paddingBottom: Math.max(height * 0.06, 50),
    paddingHorizontal: Math.max(width * 0.05, 20),
    shadowColor: '#008052',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
    borderBottomLeftRadius: Math.max(width * 0.1, 40),
    borderBottomRightRadius: Math.max(width * 0.1, 40),
    marginBottom: Math.max(height * 0.02, 20),
    position: 'relative',
    overflow: 'hidden',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#008052',
    opacity: 0.9,
  },
  headerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  headerTitle: {
    fontSize: Math.max(Math.min(width * 0.06, 26), 20),
    color: '#ffffff',
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Profile Image with 3D
  profileImageWrapper: {
    alignItems: 'center',
    marginTop: -40,
    marginBottom: 16,
    zIndex: 10,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#00B894',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#008052',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    position: 'relative',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  profileImageGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#00B894',
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#00B894',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '800',
  },

  // Profile Name
  profileNameContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileName: {
    fontSize: 22,
    color: '#008052',
    fontWeight: '800',
    textAlign: 'center',
  },

  // Content Wrapper
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 16,
  },

  // Account Settings Card with 3D
  accountSettingsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#008052',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  accountSettingsGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  sectionTitle: {
    fontSize: 20,
    color: '#1E293B',
    fontWeight: '800',
    marginBottom: 20,
  },

  // Input Fields
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  inputWrapper: {
    position: 'relative',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
    overflow: 'hidden',
  },
  inputWrapperFocused: {
    borderColor: '#008052',
    borderWidth: 2,
    shadowColor: '#008052',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    backgroundColor: '#FFFFFF',
  },
  inputIconContainer: {
    position: 'absolute',
    left: 12,
    top: 10,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  inputIcon: {
    fontSize: 16,
  },
  inputIconImage: {
    width: 16,
    height: 16,
  },
  userIconImage: {
    width: 16,
    height: 16,
  },
  mobileIconImage: {
    width: 22,
    height: 22,
  },
  textInput: {
    fontSize: 15,
    color: '#334155',
    fontWeight: '400',
    paddingHorizontal: 44,
    paddingVertical: 12,
    minHeight: 44,
    letterSpacing: 0.1,
  },


  // Update Button
  updateButtonContainer: {
    marginBottom: 20,
  },
  updateButton: {
    backgroundColor: '#00B894',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 32,
    shadowColor: '#00B894',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  updateButtonGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#00B894',
    borderRadius: 20,
  },
  updateButtonText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '700',
    textAlign: 'center',
  },
  updateButtonDisabled: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  bottomSpacer: {
    height: 120,
  },
});

export default EditProfileScreen;
