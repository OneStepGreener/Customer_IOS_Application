/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState, useEffect } from 'react';
import { NewAppScreen } from '@react-native/new-app-screen';
import { StyleSheet, useColorScheme, View, Platform } from 'react-native';
import CustomStatusBar from './src/components/CustomStatusBar';
import SplashScreen from './src/screens/Splash';
import OnboardingScreen from './src/screens/Onboarding';

import SignupScreen from './src/screens/Signup';
import LoginScreen from './src/screens/Login';
import OTPScreen from './src/screens/OTP';
import DashboardScreen from './src/screens/Dashboard';
import ProfileScreen from './src/screens/Profile';
import EditProfileScreen from './src/screens/Profile/EditProfileScreen';
import NotificationScreen from './src/screens/Notifications';
import FAQScreen from './src/screens/FAQ';
import PickupHistoryScreen from './src/screens/PickupHistory';
import GiftScreen from './src/screens/Gift';
import CartScreen from './src/screens/Cart';
import HelpScreen from './src/screens/Help';
import PushNotificationService from './src/services/PushNotificationService';
import SessionService from './src/services/SessionService';
import { fetchWithTimeout } from './src/utils/apiHelper';

// API Base URL for logout
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5000'
  : 'https://your-production-url.com';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [showSplash, setShowSplash] = useState(true);
  const [currentOnboardingScreen, setCurrentOnboardingScreen] = useState(1);
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showPickupHistory, setShowPickupHistory] = useState(false);
  const [showGift, setShowGift] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [loginMobileNumber, setLoginMobileNumber] = useState('');
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  
  // Profile data state
  const [profileData, setProfileData] = useState({
    username: 'John Smith',
    mobilePhone: '+44 555 5555 55',
    address: 'hno 2-250,',
    profileImage: null,
    stats: {
      pickups: 156,
      wasteRecycled: '2.5T',
      efficiency: '85%'
    }
  });

  // Check for existing session on app startup
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('🔍 Checking for existing session...');
        
        // Check session expiration info first
        const expirationInfo = await SessionService.getSessionExpirationInfo();
        if (expirationInfo) {
          console.log('📅 Session expiration info:', {
            daysRemaining: expirationInfo.daysRemaining,
            isExpired: expirationInfo.isExpired,
            expiresAt: expirationInfo.expiresAt,
          });
        }
        
        const session = await SessionService.getSession();
        
        if (session) {
          // Check if session is expired (1 month limit)
          const expiresAt = new Date(session.expiresAt);
          const now = new Date();
          
          if (now > expiresAt) {
            console.log('⏰ Session expired (1 month limit reached), auto-logging out...');
            await SessionService.clearSession();
            
            // Reset profile data
            setProfileData({
              username: 'John Smith',
              mobilePhone: '+44 555 5555 55',
              address: 'hno 2-250,',
              profileImage: null,
              stats: {
                pickups: 156,
                wasteRecycled: '2.5T',
                efficiency: '85%'
              }
            });
            
            // Navigate to login screen
            setShowSplash(false);
            setShowLogin(true);
            setShowDashboard(false);
            setIsCheckingSession(false);
            return;
          }
          
          // Calculate days remaining
          const daysRemaining = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
          console.log('✅ Active session found, restoring user state...');
          console.log(`   Days remaining: ${daysRemaining} days`);
          
          // Restore profile data from session
          setProfileData({
            username: session.customerName || 'John Smith',
            customerName: session.customerName || 'John Smith',
            customerId: session.customerId,
            email: session.email || '',
            mobilePhone: session.mobileNumber ? `+91${session.mobileNumber}` : '+44 555 5555 55',
            address: session.address || 'hno 2-250,',
            city: session.city || '',
            state: session.state || '',
            userType: session.userType || '',
            status: session.status || '',
            profileImage: null,
            stats: {
              pickups: 156,
              wasteRecycled: '2.5T',
              efficiency: '85%'
            }
          });
          
          // Navigate directly to dashboard (skip login/splash)
          setShowSplash(false);
          setShowLogin(false);
          setShowOTP(false);
          setShowDashboard(true);
          
          // Initialize push notifications
          if (session.customerId) {
            PushNotificationService.initialize(session.customerId, Platform.OS);
          }
        } else {
          console.log('📭 No active session found or session expired');
          // Continue with normal flow (splash -> onboarding -> login)
        }
      } catch (error) {
        console.error('❌ Error checking session:', error);
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkSession();
  }, []);

  const handleSplashComplete = () => {
    // Only proceed if session check is complete
    if (!isCheckingSession) {
      setShowSplash(false);
    }
  };
  
  // Skip splash if session check completes and user is logged in
  useEffect(() => {
    if (!isCheckingSession && profileData?.customerId) {
      // User has session, splash will be skipped by session check
      setShowSplash(false);
    }
  }, [isCheckingSession, profileData?.customerId]);

  const handleOnboardingSkip = () => {
    setShowSignup(true); // Go to signup screen
  };

  const handleNavigateToLogin = () => {
    setShowLogin(true); // Go to login screen
  };

  const handleOnboardingNext = () => {
    setShowSignup(true); // Go to signup screen
  };

  const handleSignupBack = () => {
    setShowSignup(false);
    setCurrentOnboardingScreen(1); // Go back to first onboarding screen
  };

  const handleLoginBack = () => {
    setShowLogin(false);
    setCurrentOnboardingScreen(1); // Go back to first onboarding screen
  };

  const handleSignupSave = (formData) => {
    console.log('Form data saved:', formData);
    // Here you can handle the form submission
    // For now, just go to main app
    setShowSignup(false);
    setCurrentOnboardingScreen(0);
  };

  const handleGenerateOTP = (mobileNumber) => {
    console.log('Generate OTP clicked for:', mobileNumber);
    setLoginMobileNumber(mobileNumber || '');
    setShowLogin(false);
    setShowOTP(true);
  };

  const handleLoginNext = () => {
    console.log('Login Next clicked');
    // Add your login logic here
  };

  const handleNavigateToSignup = (mobileNumber = '') => {
    setShowOTP(false);
    setShowLogin(false);
    setShowSignup(true);
    // Optionally pre-fill mobile number in signup if provided
    if (mobileNumber) {
      setLoginMobileNumber(mobileNumber);
    }
  };

  const handleOTPBack = () => {
    setShowOTP(false);
    setLoginMobileNumber(''); // Clear mobile number when going back
    setShowLogin(true);
  };

  const handleOTPAccept = async (customerData) => {
    console.log('OTP Accepted', customerData);
    
    // Update profileData with customer information from API
    if (customerData && customerData.customerId) {
      const updatedProfileData = {
        username: customerData.customerName || 'John Smith',
        customerName: customerData.customerName || 'John Smith',
        customerId: customerData.customerId,
        email: customerData.email || '',
        mobilePhone: customerData.mobileNumber ? `+91${customerData.mobileNumber}` : '+44 555 5555 55',
        address: customerData.address || 'hno 2-250,',
        city: customerData.city || '',
        state: customerData.state || '',
        userType: customerData.userType || '',
        status: customerData.status || '',
        profileImage: null,
        stats: {
          pickups: 156,
          wasteRecycled: '2.5T',
          efficiency: '85%'
        }
      };
      
      setProfileData(updatedProfileData);
      
      // Create and store session in AsyncStorage
      const sessionCreated = await SessionService.createSession(customerData);
      if (sessionCreated) {
        console.log('✅ Session created and stored in AsyncStorage');
      } else {
        console.warn('⚠️ Failed to create session, but continuing...');
      }
    }
    
    setShowOTP(false);
    setShowDashboard(true); // Go to Dashboard screen
  };

  // Initialize push notifications when customer logs in
  useEffect(() => {
    if (profileData?.customerId) {
      console.log('🔔 Initializing push notifications for customer:', profileData.customerId);
      PushNotificationService.initialize(profileData.customerId, Platform.OS);
    }
  }, [profileData?.customerId]);

  const handleOTPSendAgain = () => {
    console.log('Send OTP again');
    // Add your resend OTP logic here
  };

  const handleOTPReEnterMobile = () => {
    setShowOTP(false);
    setShowLogin(true);
  };

  const handleNavigateToProfile = () => {
    setShowDashboard(false);
    setShowProfile(true);
  };

  const handleNavigateToNotifications = () => {
    setShowDashboard(false);
    setShowNotifications(true);
  };

  const handleNavigateToClock = () => {
    setShowDashboard(false);
    setShowPickupHistory(true);
  };

  const handleNavigateToFAQ = () => {
    setShowDashboard(false);
    setShowFAQ(true);
  };

  const handleNavigateToGift = () => {
    setShowDashboard(false);
    setShowGift(true);
  };

  const handleNavigateToCart = () => {
    setShowDashboard(false);
    setShowCart(true);
  };

  const handleProfileBack = () => {
    setShowProfile(false);
    setShowDashboard(true);
  };

  const handleNavigateToEditProfile = () => {
    setShowProfile(false);
    setShowEditProfile(true);
  };

  const handleEditProfileBack = () => {
    setShowEditProfile(false);
    setShowProfile(true);
  };

  const handleUpdateProfile = async (updatedData) => {
    setProfileData(updatedData);
    
    // Update session in AsyncStorage with new profile data
    if (updatedData && updatedData.customerId) {
      await SessionService.updateSession({
        customerName: updatedData.customerName || updatedData.username,
        email: updatedData.email || '',
        address: updatedData.address || '',
        city: updatedData.city || '',
        state: updatedData.state || '',
        userType: updatedData.userType || '',
      });
      console.log('✅ Session updated after profile edit');
    }
    
    setShowEditProfile(false);
    setShowProfile(true);
  };

  const handleLogout = async () => {
    console.log('🚪 Logout initiated');
    
    try {
      // Get session token before clearing
      const sessionToken = await SessionService.getSessionToken();
      const session = await SessionService.getSession();
      
      // Call logout API (optional - for logging purposes)
      try {
        await fetchWithTimeout(
          `${API_BASE_URL}/api/logout`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              customerId: profileData?.customerId,
              sessionToken: sessionToken,
            }),
          },
          60000 // 60 seconds timeout
        );
      } catch (apiError) {
        console.warn('⚠️ Logout API call failed (continuing anyway):', apiError);
      }
      
      // Clear session from AsyncStorage
      await SessionService.clearSession();
      console.log('✅ Session cleared from AsyncStorage');
      
      // Reset all screen states to false
      setShowProfile(false);
      setShowEditProfile(false);
      setShowDashboard(false);
      setShowNotifications(false);
      setShowFAQ(false);
      setShowPickupHistory(false);
      setShowGift(false);
      setShowCart(false);
      setShowHelp(false);
      setShowOTP(false);
      
      // Reset profile data to default
      setProfileData({
        username: 'John Smith',
        mobilePhone: '+44 555 5555 55',
        address: 'hno 2-250,',
        profileImage: null,
        stats: {
          pickups: 156,
          wasteRecycled: '2.5T',
          efficiency: '85%'
        }
      });
      
      // Navigate to login screen
      setShowLogin(true);
      console.log('✅ Logout completed');
    } catch (error) {
      console.error('❌ Error during logout:', error);
      // Still navigate to login even if logout fails
      setShowDashboard(false);
      setShowLogin(true);
    }
  };

  const handleNotificationsBack = () => {
    setShowNotifications(false);
    setShowDashboard(true);
  };

  const handleFAQBack = () => {
    setShowFAQ(false);
    setShowDashboard(true);
  };

  const handlePickupHistoryBack = () => {
    setShowPickupHistory(false);
    setShowDashboard(true);
  };

  const handleGiftBack = () => {
    setShowGift(false);
    setShowDashboard(true);
  };

  const handleCartBack = () => {
    setShowCart(false);
    setShowDashboard(true);
  };

  const handleNavigateToHelp = () => {
    setShowProfile(false);
    setShowHelp(true);
  };

  const handleHelpBack = () => {
    setShowHelp(false);
    setShowProfile(true);
  };

  // Show splash screen only if not checking session and no active session
  if (showSplash && !isCheckingSession) {
    return <SplashScreen onSplashComplete={handleSplashComplete} />;
  }
  
  // Show nothing while checking session (brief loading state)
  if (isCheckingSession) {
    return null; // or return a loading screen if you have one
  }

  if (showProfile) {
    return (
      <ProfileScreen 
        onBack={handleProfileBack}
        onNavigateToDashboard={() => {
          setShowProfile(false);
          setShowDashboard(true);
        }}
        onNavigateToGift={() => {
          setShowProfile(false);
          setShowGift(true);
        }}
        onNavigateToCart={() => {
          setShowProfile(false);
          setShowCart(true);
        }}
        onNavigateToFAQ={() => {
          setShowProfile(false);
          setShowFAQ(true);
        }}
        onNavigateToClock={() => {
          setShowProfile(false);
          setShowPickupHistory(true);
        }}
        onNavigateToHelp={handleNavigateToHelp}
        onNavigateToEditProfile={handleNavigateToEditProfile}
        onLogout={handleLogout}
        profileData={profileData}
      />
    );
  }

  if (showEditProfile) {
    return (
      <EditProfileScreen 
        onBack={handleEditProfileBack}
        onNavigateToDashboard={() => {
          setShowEditProfile(false);
          setShowDashboard(true);
        }}
        onNavigateToGift={() => {
          setShowEditProfile(false);
          setShowGift(true);
        }}
        onNavigateToCart={() => {
          setShowEditProfile(false);
          setShowCart(true);
        }}
        onNavigateToFAQ={() => {
          setShowEditProfile(false);
          setShowFAQ(true);
        }}
        onNavigateToClock={() => {
          setShowEditProfile(false);
          setShowPickupHistory(true);
        }}
        profileData={profileData}
        onUpdateProfile={handleUpdateProfile}
      />
    );
  }

  if (showNotifications) {
    return (
      <NotificationScreen 
        onBack={handleNotificationsBack}
        onNavigateToDashboard={() => {
          setShowNotifications(false);
          setShowDashboard(true);
        }}
        onNavigateToGift={() => {
          setShowNotifications(false);
          setShowGift(true);
        }}
        onNavigateToCart={() => {
          setShowNotifications(false);
          setShowCart(true);
        }}
        onNavigateToFaq={() => {
          console.log('Navigating from Notifications to FAQ');
          setShowNotifications(false);
          setShowFAQ(true);
        }}
        onNavigateToClock={() => {
          setShowNotifications(false);
          setShowPickupHistory(true);
        }}
        customerId={profileData?.customerId}
      />
    );
  }

  if (showFAQ) {
    return (
      <FAQScreen 
        onBack={handleFAQBack}
        onNavigateToDashboard={() => {
          setShowFAQ(false);
          setShowDashboard(true);
        }}
        onNavigateToGift={() => {
          setShowFAQ(false);
          setShowGift(true);
        }}
        onNavigateToCart={() => {
          setShowFAQ(false);
          setShowCart(true);
        }}
        onNavigateToFaq={() => {
          console.log('Already on FAQ screen');
        }}
        onNavigateToClock={() => {
          setShowFAQ(false);
          setShowPickupHistory(true);
        }}
        onNavigateToHelp={() => {
          setShowFAQ(false);
          setShowHelp(true);
        }}
      />
    );
  }

  if (showPickupHistory) {
    return (
      <PickupHistoryScreen 
        onNavigateToDashboard={handlePickupHistoryBack}
        onNavigateToProfile={() => {
          setShowPickupHistory(false);
          setShowProfile(true);
        }}
        onNavigateToNotifications={() => {
          setShowPickupHistory(false);
          setShowNotifications(true);
        }}
        onNavigateToClock={() => {
          console.log('Already on PickupHistory screen');
        }}
        onNavigateToFAQ={() => {
          setShowPickupHistory(false);
          setShowFAQ(true);
        }}
        onNavigateToGift={() => {
          setShowPickupHistory(false);
          setShowGift(true);
        }}
        onNavigateToCart={() => {
          setShowPickupHistory(false);
          setShowCart(true);
        }}
      />
    );
  }

  if (showGift) {
    return (
      <GiftScreen 
        onNavigateToDashboard={handleGiftBack}
        onNavigateToNotifications={() => {
          setShowGift(false);
          setShowNotifications(true);
        }}
        onNavigateToCart={() => {
          setShowGift(false);
          setShowCart(true);
        }}
        onNavigateToFaq={() => {
          setShowGift(false);
          setShowFAQ(true);
        }}
        onNavigateToClock={() => {
          setShowGift(false);
          setShowPickupHistory(true);
        }}
      />
    );
  }

  if (showCart) {
    return (
      <CartScreen 
        onNavigateToDashboard={handleCartBack}
        onNavigateToNotifications={() => {
          setShowCart(false);
          setShowNotifications(true);
        }}
        onNavigateToGift={() => {
          setShowCart(false);
          setShowGift(true);
        }}
        onNavigateToFaq={() => {
          setShowCart(false);
          setShowFAQ(true);
        }}
        onNavigateToClock={() => {
          setShowCart(false);
          setShowPickupHistory(true);
        }}
      />
    );
  }

  if (showHelp) {
    return (
      <HelpScreen 
        onNavigateToDashboard={() => {
          setShowHelp(false);
          setShowDashboard(true);
        }}
        onNavigateToGift={() => {
          setShowHelp(false);
          setShowGift(true);
        }}
        onNavigateToCart={() => {
          setShowHelp(false);
          setShowCart(true);
        }}
        onNavigateToFAQ={() => {
          setShowHelp(false);
          setShowFAQ(true);
        }}
        onNavigateToClock={() => {
          setShowHelp(false);
          setShowPickupHistory(true);
        }}
        onNavigateToProfile={() => {
          setShowHelp(false);
          setShowProfile(true);
        }}
      />
    );
  }

  if (showDashboard) {
    return (
      <DashboardScreen 
        onNavigateToProfile={handleNavigateToProfile}
        onNavigateToNotifications={handleNavigateToNotifications}
        onNavigateToClock={handleNavigateToClock}
        onNavigateToFAQ={handleNavigateToFAQ}
        onNavigateToGift={handleNavigateToGift}
        onNavigateToCart={handleNavigateToCart}
      />
    );
  }

  if (showOTP) {
    return (
      <OTPScreen 
        mobileNumber={loginMobileNumber}
        onBack={handleOTPBack}
        onAccept={handleOTPAccept}
        onSendAgain={handleOTPSendAgain}
        onReEnterMobile={handleOTPReEnterMobile}
        onNavigateToSignup={handleNavigateToSignup}
      />
    );
  }

  if (showLogin) {
    return (
      <LoginScreen 
        onBack={handleLoginBack}
        onGenerateOTP={handleGenerateOTP}
        onNext={handleLoginNext}
        onNavigateToSignup={handleNavigateToSignup}
      />
    );
  }

  if (showSignup) {
    return (
      <SignupScreen 
        onBack={handleSignupBack}
        onSave={handleSignupSave}
        onNavigateToLogin={handleNavigateToLogin}
        prefillMobileNumber={loginMobileNumber}
      />
    );
  }

  if (currentOnboardingScreen === 1) {
    return (
      <OnboardingScreen 
        onNavigateToLogin={handleNavigateToLogin}
        currentScreen={1}
        totalScreens={1}
      />
    );
  }

  return (
    <View style={styles.container}>
      <CustomStatusBar backgroundColor="#008052" barStyle="light-content" />
      <NewAppScreen templateFileName="App.tsx" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
