import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
  Platform,
  StatusBar,
} from 'react-native';
import BottomNavigation from '../../components/BottomNavigation';
import CustomStatusBar, { getStatusBarHeight } from '../../components/CustomStatusBar';

const { width, height } = Dimensions.get('window');

const GiftScreen = ({ onNavigateToDashboard, onNavigateToNotifications, onNavigateToCart, onNavigateToFaq, onNavigateToClock }) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const giftRainAnim = useRef(new Animated.Value(0)).current;
  
  // Gift rain animation refs
  const giftAnimations = useRef([]).current;
  const [giftRaining, setGiftRaining] = useState(false);

  useEffect(() => {
    // Initialize gift animations
    for (let i = 0; i < 20; i++) {
      giftAnimations[i] = new Animated.Value(-100);
    }

    // Start main animations
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
    ]).start();

    // Start gift rain after 500ms
    setTimeout(() => {
      startGiftRain();
    }, 500);
  }, []);

  const startGiftRain = () => {
    setGiftRaining(true);
    
    const rainAnimations = giftAnimations.map((anim, index) => {
      const delay = index * 100;
      const duration = 2000 + Math.random() * 1000;
      const startX = Math.random() * width;
      
      return Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(anim, {
            toValue: height + 100,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(
            new Animated.Value(0),
            {
              toValue: 1,
              duration: duration,
              useNativeDriver: true,
            }
          ),
        ]),
      ]);
    });

    Animated.parallel(rainAnimations).start(() => {
      setGiftRaining(false);
      // Reset animations
      giftAnimations.forEach(anim => anim.setValue(-100));
    });
  };

  // Navigation handlers
  const handleDashboardPress = () => {
    if (onNavigateToDashboard) {
      onNavigateToDashboard();
    }
  };

  const handleGiftPress = () => {
    console.log('Gift pressed from GiftScreen');
    // Already on gift screen, do nothing
  };

  const handleCartPress = () => {
    if (onNavigateToCart) {
      onNavigateToCart();
    }
  };

  const handleFaqPress = () => {
    if (onNavigateToFaq) {
      onNavigateToFaq();
    }
  };

  const handleClockPress = () => {
    if (onNavigateToClock) {
      onNavigateToClock();
    }
  };

  return (
    <View style={styles.container}>
      <CustomStatusBar backgroundColor="#8B5CF6" barStyle="light-content" />
      
      {/* Gift Rain Animation */}
      {giftRaining && (
        <View style={styles.giftRainContainer}>
          {giftAnimations.map((anim, index) => (
            <Animated.View
              key={index}
              style={[
                styles.fallingGift,
                {
                  left: Math.random() * width,
                  transform: [
                    {
                      translateY: anim,
                    },
                    {
                      rotate: anim.interpolate({
                        inputRange: [-100, height + 100],
                        outputRange: ['0deg', '360deg'],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.giftEmoji}>🎁</Text>
            </Animated.View>
          ))}
        </View>
      )}

      {/* Sticky Header with 3D Effect */}
      <Animated.View 
        style={[
          styles.stickyHeader,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.headerGradient} />
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Gift Rewards</Text>
        </View>
      </Animated.View>
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Coming Soon Card */}
        <Animated.View 
          style={[
            styles.comingSoonCard,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          <View style={styles.cardGradient} />
          
          {/* Gift Icon */}
          <View style={styles.giftIconContainer}>
            <View style={styles.giftIconBackground}>
              <Text style={styles.giftIcon}>🎁</Text>
            </View>
          </View>

          {/* Content */}
          <Text style={styles.comingSoonTitle}>Coming Soon!</Text>
          <Text style={styles.comingSoonSubtitle}>
            We're preparing something amazing for you
          </Text>
          <Text style={styles.comingSoonDescription}>
            Get ready for exclusive rewards, points, and exciting gifts for your eco-friendly efforts. Stay tuned for the launch!
          </Text>

          {/* Feature Preview */}
          <View style={styles.featurePreview}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureEmoji}>⭐</Text>
              </View>
              <Text style={styles.featureText}>Earn Points</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureEmoji}>🎯</Text>
              </View>
              <Text style={styles.featureText}>Redeem Rewards</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureEmoji}>🏆</Text>
              </View>
              <Text style={styles.featureText}>Exclusive Gifts</Text>
            </View>
          </View>


        </Animated.View>

        {/* Additional Info Cards */}
        <Animated.View 
          style={[
            styles.infoCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.infoCardGradient} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>How It Works</Text>
            <View style={styles.infoSteps}>
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.stepText}>Recycle regularly and earn points</Text>
              </View>
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.stepText}>Accumulate points for rewards</Text>
              </View>
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.stepText}>Redeem for amazing gifts</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <BottomNavigation
        activeTab="gift"
        onDashboardPress={handleDashboardPress}
        onGiftPress={handleGiftPress}
        onCartPress={handleCartPress}
        onFaqPress={handleFaqPress}
        onClockPress={handleClockPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F7FF',
  },

  // Gift Rain Animation
  giftRainContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    pointerEvents: 'none',
  },
  fallingGift: {
    position: 'absolute',
    zIndex: 1001,
  },
  giftEmoji: {
    fontSize: 24,
  },

  // Sticky Header with 3D Gradient
  stickyHeader: {
    backgroundColor: '#8B5CF6',
    paddingTop: getStatusBarHeight() + Math.max(height * 0.02, 15),
    paddingBottom: Math.max(height * 0.02, 15),
    paddingHorizontal: Math.max(width * 0.05, 20),
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
    borderBottomLeftRadius: Math.max(width * 0.1, 40),
    borderBottomRightRadius: Math.max(width * 0.1, 40),
    position: 'relative',
    overflow: 'hidden',
    zIndex: 1000,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#8B5CF6',
    opacity: 0.9,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Scroll View
  scrollView: {
    flex: 1,
    backgroundColor: '#F8F7FF',
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 120,
  },

  // Coming Soon Card
  comingSoonCard: {
    backgroundColor: '#ffffff',
    borderRadius: 32,
    padding: 32,
    marginHorizontal: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 20,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  cardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  giftIconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  giftIconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  giftIcon: {
    fontSize: 40,
  },
  comingSoonTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  comingSoonSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  comingSoonDescription: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },

  // Feature Preview
  featurePreview: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureEmoji: {
    fontSize: 20,
  },
  featureText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },



  // Info Card
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    marginTop: 20,
    marginHorizontal: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  infoCardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    borderRadius: 24,
  },
  infoContent: {
    zIndex: 1,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoSteps: {
    gap: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  stepText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
    flex: 1,
  },

  bottomSpacer: {
    height: 20,
  },
});

export default GiftScreen;
