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

const CartScreen = ({ onNavigateToDashboard, onNavigateToNotifications, onNavigateToGift, onNavigateToFaq, onNavigateToClock }) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const cartBounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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

    // Start cart bounce animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(cartBounceAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(cartBounceAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Navigation handlers
  const handleDashboardPress = () => {
    if (onNavigateToDashboard) {
      onNavigateToDashboard();
    }
  };

  const handleGiftPress = () => {
    if (onNavigateToGift) {
      onNavigateToGift();
    }
  };

  const handleCartPress = () => {
    console.log('Cart pressed from CartScreen');
    // Already on cart screen, do nothing
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
      <CustomStatusBar backgroundColor="#F59E0B" barStyle="light-content" />
      
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
          <Text style={styles.headerTitle}>Shopping Cart</Text>
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
          
          {/* Cart Icon with Bounce Animation */}
          <View style={styles.cartIconContainer}>
            <Animated.View 
              style={[
                styles.cartIconBackground,
                {
                  transform: [
                    {
                      translateY: cartBounceAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -10],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.cartIcon}>🛒</Text>
            </Animated.View>
          </View>

          {/* Content */}
          <Text style={styles.comingSoonTitle}>Coming Soon!</Text>
          <Text style={styles.comingSoonSubtitle}>
            Your eco-friendly shopping experience is on the way
          </Text>
          <Text style={styles.comingSoonDescription}>
            Shop for sustainable products, eco-friendly items, and recycling supplies. Get ready for a seamless shopping experience that rewards your green choices!
          </Text>

          {/* Feature Preview */}
          <View style={styles.featurePreview}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureEmoji}>🌱</Text>
              </View>
              <Text style={styles.featureText}>Eco Products</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureEmoji}>♻️</Text>
              </View>
              <Text style={styles.featureText}>Recycling Supplies</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureEmoji}>💰</Text>
              </View>
              <Text style={styles.featureText}>Green Rewards</Text>
            </View>
          </View>


        </Animated.View>



        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <BottomNavigation
        activeTab="cart"
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
    backgroundColor: '#FFFBEB',
  },

  // Sticky Header with 3D Gradient
  stickyHeader: {
    backgroundColor: '#F59E0B',
    paddingTop: getStatusBarHeight() + Math.max(height * 0.02, 15),
    paddingBottom: Math.max(height * 0.02, 15),
    paddingHorizontal: Math.max(width * 0.05, 20),
    shadowColor: '#F59E0B',
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
    backgroundColor: '#F59E0B',
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
    backgroundColor: '#FFFBEB',
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
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 20,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
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
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  cartIconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  cartIconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  cartIcon: {
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
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
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





  bottomSpacer: {
    height: 20,
  },
});

export default CartScreen;
