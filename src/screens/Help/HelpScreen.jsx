import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
  Animated,
  Platform,
} from 'react-native';
import BottomNavigation from '../../components/BottomNavigation';
import CustomStatusBar, { getStatusBarHeight } from '../../components/CustomStatusBar';

const { width, height } = Dimensions.get('window');

const HelpScreen = ({ 
  onNavigateToDashboard, 
  onNavigateToGift, 
  onNavigateToCart, 
  onNavigateToFAQ, 
  onNavigateToClock,
  onNavigateToProfile 
}) => {
  const [activeTab, setActiveTab] = useState('contact');
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const headerSlideAnim = useRef(new Animated.Value(-100)).current;
  const cardScaleAnim = useRef(new Animated.Value(0.8)).current;

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
      Animated.timing(headerSlideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(cardScaleAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleCall = () => {
    const phoneNumber = '+918744901010';
    const url = Platform.OS === 'ios' ? `telprompt:${phoneNumber}` : `tel:${phoneNumber}`;
    
    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Unable to make phone call');
        }
      })
      .catch(err => {
        Alert.alert('Error', 'Unable to make phone call');
      });
  };

  const handleEmail = () => {
    const email = 'customercare@onestepgreener.org';
    const subject = 'Customer Support Request';
    const body = 'Hello, I need help with...';
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Unable to open email app');
        }
      })
      .catch(err => {
        Alert.alert('Error', 'Unable to open email app');
      });
  };

  const handleWhatsApp = () => {
    const phoneNumber = '918744901010';
    const message = 'Hello, I need help with OneStepGreener app';
    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert('Error', 'WhatsApp is not installed');
        }
      })
      .catch(err => {
        Alert.alert('Error', 'Unable to open WhatsApp');
      });
  };



  const renderContactCard = (icon, title, subtitle, action, color) => (
    <Animated.View
      style={[
        styles.contactCard,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: cardScaleAnim }
          ]
        }
      ]}
    >
      <TouchableOpacity style={styles.contactCardTouchable} onPress={action}>
        <View style={styles.contactCardGradient} />
        <View style={[styles.contactIconContainer, { backgroundColor: `${color}15` }]}>
          <Text style={[styles.contactIcon, { color: color }]}>{icon}</Text>
        </View>
        <View style={styles.contactTextContainer}>
          <Text style={styles.contactTitle}>{title}</Text>
          <Text style={styles.contactSubtitle}>{subtitle}</Text>
        </View>
        <View style={[styles.contactArrowContainer, { backgroundColor: `${color}15` }]}>
          <Text style={[styles.contactArrow, { color: color }]}>›</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );



  return (
    <View style={styles.container}>
      <CustomStatusBar backgroundColor="#008052" barStyle="light-content" />
      
      {/* Header */}
      <Animated.View 
        style={[
          styles.header,
          {
            transform: [{ translateY: headerSlideAnim }]
          }
        ]}
      >
        <View style={styles.headerGradient} />
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Help & Support</Text>
          <Text style={styles.headerSubtitle}>We're here to help you</Text>
        </View>
      </Animated.View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Contact Section */}
        <Animated.View 
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }]
            }
          ]}
        >
          <Text style={styles.sectionTitle}>Get in Touch</Text>
          <Text style={styles.sectionSubtitle}>Choose your preferred way to contact us</Text>
          
          {renderContactCard(
            '📞',
            'Call Us',
            '+91 8744901010',
            handleCall,
            '#008052'
          )}
          
          {renderContactCard(
            '📧',
            'Email Us',
            'customercare@onestepgreener.org',
            handleEmail,
            '#3498DB'
          )}
          
          {renderContactCard(
            '💬',
            'WhatsApp',
            'Chat with us instantly',
            handleWhatsApp,
            '#25D366'
          )}
          

        </Animated.View>



        {/* Support Info */}
        <Animated.View 
          style={[
            styles.supportInfoCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }]
            }
          ]}
        >
          <View style={styles.supportInfoGradient} />
          <View style={styles.supportInfoContent}>
            <Text style={styles.supportInfoIcon}>🕒</Text>
            <Text style={styles.supportInfoTitle}>Response Time</Text>
            <Text style={styles.supportInfoText}>
              We typically respond within 2-4 hours during business hours. 
              For urgent matters, please call us directly.
            </Text>
          </View>
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab="help"
        onDashboardPress={onNavigateToDashboard}
        onGiftPress={onNavigateToGift}
        onCartPress={onNavigateToCart}
        onFaqPress={onNavigateToFAQ}
        onClockPress={onNavigateToClock}
        onProfilePress={onNavigateToProfile}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8F5',
  },
  
  // Header with 3D Gradient
  header: {
    backgroundColor: '#008052',
    paddingTop: getStatusBarHeight() + Math.max(height * 0.02, 15),
    paddingBottom: Math.max(height * 0.04, 30),
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
    zIndex: 1,
  },
  headerTitle: {
    fontSize: Math.max(Math.min(width * 0.07, 30), 24),
    color: '#ffffff',
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerSubtitle: {
    fontSize: Math.max(Math.min(width * 0.04, 18), 14),
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    marginTop: 4,
  },

  scrollView: {
    flex: 1,
    paddingHorizontal: Math.max(width * 0.05, 20),
  },

  // Section Styles
  section: {
    marginBottom: Math.max(height * 0.03, 24),
  },
  sectionTitle: {
    fontSize: Math.max(Math.min(width * 0.05, 22), 18),
    color: '#1E293B',
    fontWeight: '800',
    marginBottom: Math.max(height * 0.01, 8),
  },
  sectionSubtitle: {
    fontSize: Math.max(Math.min(width * 0.035, 16), 14),
    color: '#64748B',
    fontWeight: '500',
    marginBottom: Math.max(height * 0.02, 16),
  },

  // Contact Card Styles
  contactCard: {
    marginBottom: Math.max(height * 0.015, 12),
    borderRadius: 20,
    shadowColor: '#008052',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  contactCardTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Math.max(width * 0.04, 20),
    backgroundColor: '#ffffff',
    borderRadius: 20,
    position: 'relative',
  },
  contactCardGradient: {
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
  contactIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Math.max(width * 0.04, 16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  contactIcon: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  contactTextContainer: {
    flex: 1,
  },
  contactTitle: {
    fontSize: Math.max(Math.min(width * 0.04, 18), 16),
    color: '#1E293B',
    fontWeight: '700',
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: Math.max(Math.min(width * 0.035, 16), 14),
    color: '#64748B',
    fontWeight: '500',
  },
  contactArrowContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactArrow: {
    fontSize: 20,
    fontWeight: '700',
  },



  // Support Info Card
  supportInfoCard: {
    marginBottom: Math.max(height * 0.03, 24),
    borderRadius: 20,
    shadowColor: '#008052',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
    overflow: 'hidden',
  },
  supportInfoGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 128, 82, 0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 128, 82, 0.1)',
  },
  supportInfoContent: {
    padding: Math.max(width * 0.05, 24),
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  supportInfoIcon: {
    fontSize: 32,
    marginBottom: Math.max(height * 0.01, 8),
  },
  supportInfoTitle: {
    fontSize: Math.max(Math.min(width * 0.045, 20), 18),
    color: '#1E293B',
    fontWeight: '800',
    marginBottom: Math.max(height * 0.01, 8),
    textAlign: 'center',
  },
  supportInfoText: {
    fontSize: Math.max(Math.min(width * 0.035, 16), 14),
    color: '#64748B',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
  },

  bottomSpacer: {
    height: 120,
  },
});

export default HelpScreen;
