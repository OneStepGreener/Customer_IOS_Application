import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  Animated,
  ScrollView,
  Modal,
  Linking,
} from 'react-native';
import BottomNavigation from '../../components/BottomNavigation';
import CustomStatusBar, { getStatusBarHeight } from '../../components/CustomStatusBar';
import { 
  wp, 
  hp, 
  fp, 
  rp, 
  getCardDimensions, 
  getIconDimensions, 
  getSpacing, 
  getBorderRadius, 
  getShadowStyles,
  getResponsiveDimensions 
} from '../../utils/responsive';

const { width, height } = Dimensions.get('window');

const ProfileScreen = ({ onBack, onNavigateToDashboard, onNavigateToGift, onNavigateToCart, onNavigateToFAQ, onNavigateToClock, onNavigateToEditProfile, onNavigateToHelp, onLogout, profileData }) => {
  const [profileImage, setProfileImage] = useState(profileData?.profileImage || null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  // State for status bar color
  const [statusBarColor, setStatusBarColor] = useState('#008052');
  const [statusBarStyle, setStatusBarStyle] = useState('light-content');
  const scrollViewRef = useRef(null);
  
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



  const handleEditProfile = () => {
    console.log('Edit Profile clicked');
    if (onNavigateToEditProfile) {
      onNavigateToEditProfile();
    } else {
      console.warn('onNavigateToEditProfile function not provided');
    }
  };

  const handleHelp = () => {
    console.log('Help clicked');
    if (onNavigateToHelp) {
      onNavigateToHelp();
    } else {
      console.warn('onNavigateToHelp function not provided');
    }
  };

  const handleDownloadCertificate = () => {
    console.log('Download Certificate clicked');
    // Add your download certificate logic here
    Alert.alert(
      'Download Certificate',
      'Your certificate will be downloaded shortly.',
      [{ text: 'OK' }]
    );
  };

  const handleFollowInstagram = () => {
    const instagramUrl = 'https://www.instagram.com/onestep_greener?igsh=NWRvdDc5ZG85dms1';
    
    Linking.canOpenURL(instagramUrl)
      .then(supported => {
        if (supported) {
          return Linking.openURL(instagramUrl);
        } else {
          Alert.alert('Error', 'Instagram is not installed');
        }
      })
      .catch(err => {
        Alert.alert('Error', 'Unable to open Instagram');
      });
  };

  const handleLogout = () => {
    console.log('Logout clicked');
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    console.log('Confirm logout clicked');
    setShowLogoutModal(false);
    if (onLogout) {
      onLogout();
    } else {
      console.warn('onLogout function not provided');
    }
  };

  const handleCancelLogout = () => {
    console.log('Cancel logout clicked');
    setShowLogoutModal(false);
  };

  // Handle scroll to change status bar color
  const handleScroll = (event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    const headerHeight = getStatusBarHeight() + 20 + 60 + 20; // Approximate header height
    
    if (scrollY > headerHeight * 0.5) {
      // User has scrolled past half of header, change to white status bar
      setStatusBarColor('#ffffff');
      setStatusBarStyle('dark-content');
    } else {
      // User is at top, keep green status bar
      setStatusBarColor('#008052');
      setStatusBarStyle('light-content');
    }
  };

  return (
    <View style={styles.container}>
      <CustomStatusBar backgroundColor={statusBarColor} barStyle={statusBarStyle} />
      
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
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
        <Text style={styles.headerTitle}>Profile</Text>
            <Text style={styles.headerSubtitle}>Manage your account</Text>
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
          {profileImage ? (
            <Image 
              source={{ uri: profileImage }}
              style={styles.profileImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileImageText}>{generateInitials(profileData?.customerName || profileData?.username)}</Text>
            </View>
          )}
        </View>
        </Animated.View>

        {/* Profile Content with 3D Cards */}
      <View style={styles.contentWrapper}>
          {/* Profile Name */}
          <Animated.View 
            style={[
              styles.profileNameContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }]
              }
            ]}
          >
            <Text style={styles.profileName}>{profileData?.customerName || profileData?.username || 'John Smith'}</Text>
          </Animated.View>

          {/* Stats Section */}
          <Animated.View 
            style={[
              styles.statsSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }]
              }
            ]}
          >
            <View style={styles.statsCardsContainer}>
              {/* Total Recycled Card */}
              <View style={styles.statsCard}>
                <View style={styles.cardContent}>
                  <View style={styles.cardIconContainer}>
                    <Image 
                      source={require('../../assets/images/recycle.png')}
                      style={styles.cardIcon}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.cardTextContainer}>
                    <Text style={styles.cardLabel}>Total Recycled</Text>
                    <Text style={styles.cardValue}>100 kg</Text>
                  </View>
                </View>
              </View>

              {/* Saving Planet Card */}
              <View style={styles.statsCard}>
                <View style={styles.cardContent}>
                  <View style={styles.cardIconContainer}>
                    <Image 
                      source={require('../../assets/images/earth.png')}
                      style={styles.cardIcon}
                      resizeMode="contain"
                      onError={(error) => console.log('Earth image error:', error)}
                    />
                  </View>
                  <View style={styles.cardTextContainer}>
                    <Text style={styles.cardLabel}>Saving Planet Since</Text>
                    <Text style={styles.cardValue}>2024</Text>
                  </View>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Menu Options with 3D Cards */}
          <View style={styles.menuSection}>
            {/* Edit Profile */}
            <Animated.View 
              style={[
                styles.menuItem,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }, { scale: scaleAnim }]
                }
              ]}
            >
              <TouchableOpacity style={styles.menuItemTouchable} onPress={handleEditProfile}>
                <View style={styles.menuItemGradient} />
              <View style={styles.editProfileIconContainer}>
                <Image 
                  source={require('../../assets/images/Profile.png')}
                  style={styles.editProfileIcon}
                  resizeMode="contain"
                />
              </View>
                <View style={styles.menuTextContainer}>
              <Text style={styles.menuText}>Edit Profile</Text>
                  <Text style={styles.menuSubtext}>Update your personal information</Text>
                </View>
                <View style={styles.arrowContainer}>
                  <Text style={styles.arrowText}>›</Text>
                </View>
            </TouchableOpacity>
            </Animated.View>

            {/* Help */}
            <Animated.View 
              style={[
                styles.menuItem,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }, { scale: scaleAnim }]
                }
              ]}
            >
              <TouchableOpacity style={styles.menuItemTouchable} onPress={handleHelp}>
                <View style={styles.menuItemGradient} />
              <View style={styles.menuIconContainer}>
                <Image 
                  source={require('../../assets/images/help.png')}
                  style={styles.menuIcon}
                  resizeMode="contain"
                />
              </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuText}>Help & Support</Text>
                  <Text style={styles.menuSubtext}>Get help and contact support</Text>
                </View>
                <View style={styles.arrowContainer}>
                  <Text style={styles.arrowText}>›</Text>
                </View>
            </TouchableOpacity>
            </Animated.View>

            {/* Download Certificate */}
            <Animated.View 
              style={[
                styles.menuItem,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }, { scale: scaleAnim }]
                }
              ]}
            >
              <TouchableOpacity style={styles.menuItemTouchable} onPress={handleDownloadCertificate}>
                <View style={styles.menuItemGradient} />
                <View style={styles.certificateIconContainer}>
                  <Image 
                    source={require('../../assets/images/Gift__.png')}
                    style={styles.certificateIcon}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuText}>Download Certificate</Text>
                  <Text style={styles.menuSubtext}>Get your recycling certificate</Text>
                </View>
                <View style={styles.arrowContainer}>
                  <Text style={styles.arrowText}>›</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>

            {/* Follow Us on Instagram */}
            <Animated.View 
              style={[
                styles.menuItem,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }, { scale: scaleAnim }]
                }
              ]}
            >
              <TouchableOpacity style={styles.menuItemTouchable} onPress={handleFollowInstagram}>
                <View style={styles.menuItemGradient} />
                <View style={styles.instagramIconContainer}>
                  <Text style={styles.instagramIcon}>📸</Text>
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuText}>Follow Us</Text>
                  <Text style={styles.menuSubtext}>@onestep_greener on Instagram</Text>
                </View>
                <View style={styles.arrowContainer}>
                  <Text style={styles.arrowText}>›</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>

            {/* Logout */}
            <Animated.View 
              style={[
                styles.menuItem,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }, { scale: scaleAnim }]
                }
              ]}
            >
              <TouchableOpacity style={styles.menuItemTouchable} onPress={handleLogout}>
                <View style={styles.menuItemGradient} />
                <View style={styles.logoutIconContainer}>
                <Image 
                  source={require('../../assets/images/logout.png')}
                    style={styles.logoutIcon}
                  resizeMode="contain"
                />
              </View>
                <View style={styles.menuTextContainer}>
              <Text style={styles.menuText}>Logout</Text>
                  <Text style={styles.menuSubtext}>Sign out of your account</Text>
                </View>
                <View style={styles.arrowContainer}>
                  <Text style={styles.arrowText}>›</Text>
                </View>
            </TouchableOpacity>
            </Animated.View>
          </View>
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

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelLogout}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={styles.modalContainer}>
            <View style={styles.modalGradient} />
            <View style={styles.modalContent}>
              <View style={styles.modalIconContainer}>
                <Text style={styles.modalIcon}>🔒</Text>
              </View>
              <Text style={styles.modalTitle}>End Session</Text>
              <Text style={styles.modalMessage}>Are you sure you want to log out?</Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.confirmButton]} 
                  onPress={handleConfirmLogout}
                  activeOpacity={0.8}
                >
                  <View style={styles.buttonGradient} />
                  <Text style={styles.confirmButtonText}>Yes, End Session</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]} 
                  onPress={handleCancelLogout}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>
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
    paddingTop: getStatusBarHeight() + hp(2),
    paddingBottom: hp(6),
    paddingHorizontal: wp(5),
    ...getShadowStyles(15),
    borderBottomLeftRadius: getBorderRadius('xlarge'),
    borderBottomRightRadius: getBorderRadius('xlarge'),
    marginBottom: hp(2.5),
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
    zIndex: 1,
  },
  headerTitle: {
    fontSize: fp(28),
    color: '#ffffff',
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerSubtitle: {
    fontSize: fp(16),
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    marginTop: getSpacing(0.5),
  },

  // Profile Image with 3D
  profileImageWrapper: {
    alignItems: 'center',
    marginTop: -hp(5),
    marginBottom: hp(2.5),
    zIndex: 10,
  },
  profileImageContainer: {
    width: wp(30),
    height: wp(30),
    borderRadius: wp(15),
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    ...getShadowStyles(15),
    position: 'relative',
    borderWidth: 4,
    borderColor: '#ffffff',
  },
  profileImageGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    borderRadius: 60,
  },
  profileImage: {
    width: wp(27),
    height: wp(27),
    borderRadius: wp(13.5),
  },
  profileImagePlaceholder: {
    width: wp(27),
    height: wp(27),
    borderRadius: wp(13.5),
    backgroundColor: '#008052',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    fontSize: fp(36),
    color: '#FFFFFF',
    fontWeight: '800',
  },

  // Content Wrapper
  contentWrapper: {
    flex: 1,
    paddingHorizontal: getSpacing(2),
  },

  // Profile Name Container
  profileNameContainer: {
    alignItems: 'center',
    marginBottom: getSpacing(3),
  },
  profileName: {
    fontSize: fp(28),
    color: '#1E293B',
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: getSpacing(0.5),
  },

  // Stats Section
  statsSection: {
    marginBottom: 24,
  },
  statsTitle: {
    fontSize: 20,
    color: '#1E293B',
    fontWeight: '800',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    gap: 12,
    minHeight: 80,
  },
  statsCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#008052',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 128, 82, 0.08)',
    minHeight: 80,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardIcon: {
    width: 24,
    height: 24,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#008052',
    marginBottom: 2,
  },
  cardLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },

  // Menu Section
  menuSection: {
    marginBottom: 20,
  },

  // Menu Items with 3D
  menuItem: {
    marginBottom: 16,
    borderRadius: 20,
    shadowColor: '#008052',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  menuItemTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    position: 'relative',
  },
  menuItemGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  editProfileIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: 'rgba(0, 184, 148, 0.1)',
    shadowColor: '#00B894',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  editProfileIcon: {
    width: 24,
    height: 24,
    tintColor: '#00B894',
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    shadowColor: '#3498DB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  menuIcon: {
    width: 24,
    height: 24,
    tintColor: '#3498DB',
  },
  logoutIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    shadowColor: '#E74C3C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutIcon: {
    width: 24,
    height: 24,
    tintColor: '#E74C3C',
  },
  certificateIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    shadowColor: '#FFC107',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  certificateIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFC107',
  },
  instagramIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: 'rgba(228, 64, 95, 0.1)',
    shadowColor: '#E4405F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  instagramIcon: {
    fontSize: 24,
    color: '#E4405F',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuText: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '700',
    marginBottom: 2,
  },
  menuSubtext: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 128, 82, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 18,
    color: '#008052',
    fontWeight: '700',
  },

  bottomSpacer: {
    height: 120,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  modalContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 28,
    padding: 0,
    marginHorizontal: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 20,
    minWidth: 300,
    maxWidth: 340,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
    position: 'relative',
  },
  modalGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 28,
  },
  modalContent: {
    alignItems: 'center',
    padding: 32,
    position: 'relative',
    zIndex: 1,
  },
  modalIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 128, 82, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#008052',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  modalIcon: {
    fontSize: 28,
  },
  modalTitle: {
    fontSize: 28,
    color: '#008052',
    fontWeight: '900',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 128, 82, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  modalMessage: {
    fontSize: 17,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 36,
    textAlign: 'center',
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  modalButtons: {
    width: '100%',
    gap: 16,
  },
  modalButton: {
    width: '100%',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  buttonGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#008052',
    borderRadius: 20,
  },
  cancelButton: {
    backgroundColor: 'rgba(248, 250, 252, 0.9)',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 128, 82, 0.2)',
  },
  confirmButton: {
    backgroundColor: '#008052',
    shadowColor: '#008052',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  cancelButtonText: {
    fontSize: 17,
    color: '#008052',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  confirmButtonText: {
    fontSize: 17,
    color: '#ffffff',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default ProfileScreen;
