import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  Animated,
  Platform,
} from 'react-native';
import BottomNavigation from '../../components/BottomNavigation';
import CustomStatusBar, { getStatusBarHeight } from '../../components/CustomStatusBar';

const { width, height } = Dimensions.get('window');

const FAQScreen = ({ onBack, onNavigateToDashboard, onNavigateToGift, onNavigateToCart, onNavigateToFaq, onNavigateToClock, onNavigateToHelp }) => {
  const [expandedFaq, setExpandedFaq] = useState(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim1 = useRef(new Animated.Value(0)).current;
  const rotateAnim2 = useRef(new Animated.Value(0)).current;
  const rotateAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.timing(rotateAnim1, {
          toValue: 1,
          duration: 20000,
          useNativeDriver: true,
        })
      ),
      Animated.loop(
        Animated.timing(rotateAnim2, {
          toValue: 1,
          duration: 15000,
          useNativeDriver: true,
        })
      ),
      Animated.loop(
        Animated.timing(rotateAnim3, {
          toValue: 1,
          duration: 25000,
          useNativeDriver: true,
        })
      ),
    ]).start();
  }, []);

  const faqs = [
    {
      id: 1,
      question: 'How does the recycling pickup work?',
      answer: 'Our recycling pickup service works on a scheduled basis. You can choose from weekly, monthly, or yearly pickups. Our team will collect your sorted waste and ensure it\'s properly recycled.',
      icon: '♻️',
      category: 'pickup'
    },
    {
      id: 2,
      question: 'What types of waste can I recycle?',
      answer: 'We accept paper, cardboard, plastic bottles, glass containers, metal cans, and electronic waste. Please ensure all items are clean and properly sorted before pickup.',
      icon: '🗂️',
      category: 'waste'
    },
    {
      id: 3,
      question: 'How do I earn rewards points?',
      answer: 'You earn points for every kilogram of waste recycled. The more you recycle, the more points you accumulate. You can redeem these points for exciting rewards and discounts.',
      icon: '🏆',
      category: 'rewards'
    },
    {
      id: 4,
      question: 'Can I change my pickup schedule?',
      answer: 'Yes! You can modify your pickup schedule anytime through the app. Simply go to your profile settings and update your preferred frequency.',
      icon: '📅',
      category: 'schedule'
    },
    {
      id: 5,
      question: 'How is my environmental impact calculated?',
      answer: 'We calculate your environmental impact based on the amount of waste you recycle. This includes CO2 saved, trees preserved, and water conserved through your recycling efforts.',
      icon: '🌱',
      category: 'impact'
    },
    {
      id: 6,
      question: 'What if I miss a pickup?',
      answer: 'If you miss a scheduled pickup, you can reschedule it for the next available slot. We\'ll send you a notification to confirm the new pickup time.',
      icon: '⏰',
      category: 'pickup'
    }
  ];

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const handleContactSupport = () => {
    console.log('Contact Support clicked');
    if (onNavigateToHelp) {
      onNavigateToHelp();
    } else {
      console.warn('onNavigateToHelp function not provided');
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'pickup':
        return '#059669';
      case 'waste':
        return '#f59e0b';
      case 'rewards':
        return '#8b5cf6';
      case 'schedule':
        return '#0ea5e9';
      case 'impact':
        return '#10b981';
      default:
        return '#059669';
    }
  };

  const spin1 = rotateAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const spin2 = rotateAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg'],
  });

  const spin3 = rotateAnim3.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={styles.container}>
      <CustomStatusBar backgroundColor="transparent" barStyle="light-content" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 3D Animated Header Section */}
        <View style={styles.header}>
          {/* Blurred Background Image */}
          <View style={styles.headerBackground}>
            <Image 
              source={require('../../assets/images/FaqImg.png')}
              style={styles.headerBackgroundImage}
              resizeMode="cover"
            />
            <View style={styles.blurOverlay} />
            
            {/* Animated Floating Elements */}
            <Animated.View 
              style={[
                styles.floatingCircle1,
                {
                  opacity: fadeAnim,
                  transform: [
                    { translateY: slideAnim },
                    { scale: scaleAnim },
                    { rotate: spin1 }
                  ]
                }
              ]} 
            />
            <Animated.View 
              style={[
                styles.floatingCircle2,
                {
                  opacity: fadeAnim,
                  transform: [
                    { translateY: slideAnim.interpolate({
                      inputRange: [0, 50],
                      outputRange: [0, -20]
                    }) },
                    { scale: scaleAnim.interpolate({
                      inputRange: [0.8, 1],
                      outputRange: [0.9, 1.1]
                    }) },
                    { rotate: spin2 }
                  ]
                }
              ]} 
            />
            <Animated.View 
              style={[
                styles.floatingCircle3,
                {
                  opacity: fadeAnim,
                  transform: [
                    { translateY: slideAnim.interpolate({
                      inputRange: [0, 50],
                      outputRange: [0, 15]
                    }) },
                    { scale: scaleAnim.interpolate({
                      inputRange: [0.8, 1],
                      outputRange: [0.7, 0.9]
                    }) },
                    { rotate: spin3 }
                  ]
                }
              ]} 
            />
          </View>
          
          {/* Curved Content Container */}
          <Animated.View 
            style={[
              styles.headerContentContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerTextContainer}>
                <Animated.Text 
                  style={[
                    styles.headerTitle,
                    {
                      transform: [{ scale: scaleAnim }]
                    }
                  ]}
                >
                  Frequently Asked Questions
                </Animated.Text>
              </View>
            </View>
          </Animated.View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* FAQ List */}
          <View style={styles.faqSection}>
            {faqs.map((faq) => (
              <TouchableOpacity
                key={faq.id}
                style={[
                  styles.faqCard,
                  expandedFaq === faq.id && styles.expandedFaqCard
                ]}
                onPress={() => toggleFaq(faq.id)}
                activeOpacity={0.7}
              >
                <View style={styles.faqHeader}>
                  <View style={[styles.faqIconContainer, { backgroundColor: getCategoryColor(faq.category) + '20' }]}>
                    <Text style={styles.faqIcon}>{faq.icon}</Text>
                  </View>
                  <View style={styles.faqContent}>
                    <Text style={styles.faqQuestion}>{faq.question}</Text>
                    <Text style={styles.faqExpandIcon}>
                      {expandedFaq === faq.id ? '−' : '+'}
                    </Text>
                  </View>
                </View>
                {expandedFaq === faq.id && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.answerText}>{faq.answer}</Text>
                    <View style={styles.answerGlow} />
                  </View>
                )}
                <View style={styles.cardShine} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Contact Section */}
          <View style={styles.contactSection}>
            <View style={styles.contactCard}>
              <View style={styles.contactIconContainer}>
                <Text style={styles.contactIcon}>💬</Text>
              </View>
              <Text style={styles.contactTitle}>Still have questions?</Text>
              <Text style={styles.contactSubtitle}>Our support team is here to help</Text>
              <TouchableOpacity style={styles.contactButton} onPress={handleContactSupport}>
                <Text style={styles.contactButtonText}>Contact Support</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Bottom Spacer */}
          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <BottomNavigation
        activeTab="faq"
        onDashboardPress={onNavigateToDashboard}
        onGiftPress={onNavigateToGift}
        onCartPress={onNavigateToCart}
        onFaqPress={onNavigateToFaq || (() => {
          console.log('FAQ pressed from FAQScreen - already on FAQ');
        })}
        onClockPress={onNavigateToClock}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    height: Math.max(height * 0.35, 280) + getStatusBarHeight(),
    position: 'relative',
    overflow: 'hidden',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerBackgroundImage: {
    width: '100%',
    height: '100%',
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 128, 82, 0.7)',
  },
  floatingCircle1: {
    position: 'absolute',
    top: getStatusBarHeight() + Math.max(height * 0.02, 15),
    right: Math.max(width * 0.05, 20),
    width: Math.max(width * 0.15, 60),
    height: Math.max(width * 0.15, 60),
    borderRadius: Math.max(width * 0.075, 30),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  floatingCircle2: {
    position: 'absolute',
    top: getStatusBarHeight() + Math.max(height * 0.08, 30),
    left: Math.max(width * 0.08, 30),
    width: Math.max(width * 0.12, 48),
    height: Math.max(width * 0.12, 48),
    borderRadius: Math.max(width * 0.06, 24),
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  floatingCircle3: {
    position: 'absolute',
    bottom: Math.max(height * 0.02, 15),
    right: Math.max(width * 0.15, 60),
    width: Math.max(width * 0.1, 40),
    height: Math.max(width * 0.1, 40),
    borderRadius: Math.max(width * 0.05, 20),
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContentContainer: {
    position: 'absolute',
    bottom: -Math.max(height * 0.03, 25),
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: Math.max(width * 0.08, 30),
    borderTopRightRadius: Math.max(width * 0.08, 30),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Math.max(width * 0.05, 20),
    paddingVertical: Math.max(height * 0.025, 20),
    paddingTop: getStatusBarHeight() + Math.max(height * 0.025, 20),
    paddingBottom: Math.max(height * 0.05, 35),
  },
  headerTextContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Math.max(Math.min(width * 0.06, 24), 20),
    fontWeight: 'bold',
    color: '#008052',
    marginBottom: Math.max(height * 0.005, 4),
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: Math.max(Math.min(width * 0.035, 14), 12),
    color: '#64748b',
    fontWeight: '500',
  },
  content: {
    backgroundColor: '#ffffff',
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.06,
  },
  sectionTitle: {
    fontSize: Math.max(width * 0.05, 20),
    color: '#008052',
    fontWeight: 'bold',
    marginBottom: Math.max(height * 0.02, 15),
  },
  // FAQ Section
  faqSection: {
    marginBottom: Math.max(height * 0.04, 30),
  },
  faqCard: {
    backgroundColor: '#ffffff',
    borderRadius: Math.max(width * 0.08, 30),
    padding: Math.max(width * 0.04, 16),
    marginBottom: Math.max(height * 0.015, 12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  expandedFaqCard: {
    shadowColor: '#008052',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  faqIconContainer: {
    width: Math.max(width * 0.12, 48),
    height: Math.max(width * 0.12, 48),
    borderRadius: Math.max(width * 0.06, 24),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Math.max(width * 0.03, 12),
  },
  faqIcon: {
    fontSize: Math.max(width * 0.06, 24),
  },
  faqContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    fontSize: Math.max(width * 0.04, 16),
    color: '#1e293b',
    fontWeight: '600',
    flex: 1,
    marginRight: Math.max(width * 0.02, 8),
  },
  faqExpandIcon: {
    fontSize: Math.max(width * 0.06, 24),
    color: '#008052',
    fontWeight: 'bold',
  },
  faqAnswer: {
    marginTop: Math.max(height * 0.015, 12),
    paddingTop: Math.max(height * 0.015, 12),
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 128, 82, 0.1)',
    position: 'relative',
  },
  answerText: {
    fontSize: Math.max(width * 0.035, 14),
    color: '#64748b',
    lineHeight: Math.max(width * 0.045, 20),
  },
  answerGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 128, 82, 0.05)',
    borderRadius: Math.max(width * 0.04, 16),
    zIndex: -1,
  },
  cardShine: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{ rotate: '45deg' }],
  },

  // Contact Section
  contactSection: {
    marginBottom: Math.max(height * 0.04, 30),
  },
  contactCard: {
    backgroundColor: '#ffffff',
    borderRadius: Math.max(width * 0.08, 30),
    padding: Math.max(width * 0.05, 20),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 12,
  },
  contactIconContainer: {
    width: Math.max(width * 0.15, 60),
    height: Math.max(width * 0.15, 60),
    borderRadius: Math.max(width * 0.075, 30),
    backgroundColor: 'rgba(0, 128, 82, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Math.max(height * 0.02, 15),
  },
  contactIcon: {
    fontSize: Math.max(width * 0.08, 32),
  },
  contactTitle: {
    fontSize: Math.max(width * 0.05, 20),
    color: '#008052',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: Math.max(height * 0.01, 8),
  },
  contactSubtitle: {
    fontSize: Math.max(width * 0.035, 14),
    color: '#64748b',
    textAlign: 'center',
    marginBottom: Math.max(height * 0.02, 15),
  },
  contactButton: {
    backgroundColor: '#008052',
    paddingHorizontal: Math.max(width * 0.06, 24),
    paddingVertical: Math.max(height * 0.015, 12),
    borderRadius: Math.max(width * 0.06, 24),
    shadowColor: '#008052',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  contactButtonText: {
    fontSize: Math.max(width * 0.035, 14),
    color: '#ffffff',
    fontWeight: 'bold',
  },
  bottomSpacer: {
    height: Math.max(height * 0.20, 150),
  },
});

export default FAQScreen;
