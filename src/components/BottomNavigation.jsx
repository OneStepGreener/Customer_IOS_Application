import React from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { wp, hp, rp, getIconDimensions, getSpacing, getBorderRadius, getShadowStyles } from '../utils/responsive';

const { width, height } = Dimensions.get('window');

const BottomNavigation = ({ 
  activeTab = 'dashboard', 
  onDashboardPress, 
  onGiftPress, 
  onCartPress, 
  onFaqPress, 
  onClockPress 
}) => {
  return (
    <View style={styles.bottomNavigation}>
      <TouchableOpacity 
        style={[styles.navItem, activeTab === 'dashboard' && styles.activeNavItem]} 
        onPress={onDashboardPress}
        activeOpacity={0.7}
      >
        <View style={[styles.navIconContainer, activeTab === 'dashboard' && styles.activeNavIconContainer]}>
          <Image 
            source={require('../assets/images/home.png')}
            style={[styles.navIcon, activeTab === 'dashboard' && styles.activeNavIcon]}
            resizeMode="contain"
          />
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.navItem, activeTab === 'gift' && styles.activeNavItem]} 
        onPress={onGiftPress}
      >
        <View style={[styles.navIconContainer, activeTab === 'gift' && styles.activeNavIconContainer]}>
          <Image 
            source={require('../assets/images/Gift__.png')}
            style={[styles.navIcon, activeTab === 'gift' && styles.activeNavIcon]}
            resizeMode="contain"
          />
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.navItem, styles.cartNavItem, activeTab === 'cart' && styles.activeCartNavItem]} 
        onPress={onCartPress}
      >
        <View style={[styles.cartIconContainer, activeTab === 'cart' && styles.activeCartIconContainer]}>
          <Image 
            source={require('../assets/images/ShoppingCart.png')}
            style={styles.cartIcon}
            resizeMode="contain"
          />
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.navItem, activeTab === 'faq' && styles.activeNavItem]} 
        onPress={() => {
          console.log('FAQ button pressed in BottomNavigation');
          onFaqPress && onFaqPress();
        }}
        activeOpacity={0.7}
      >
        <View style={[styles.navIconContainer, activeTab === 'faq' && styles.activeNavIconContainer]}>
          <Image 
            source={require('../assets/images/Faq.png')}
            style={[styles.navIcon, activeTab === 'faq' && styles.activeNavIcon]}
            resizeMode="contain"
          />
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.navItem, activeTab === 'clock' && styles.activeNavItem]} 
        onPress={onClockPress}
      >
        <View style={[styles.navIconContainer, activeTab === 'clock' && styles.activeNavIconContainer]}>
          <Image 
            source={require('../assets/images/clock.png')}
            style={[styles.navIcon, activeTab === 'clock' && styles.activeNavIcon]}
            resizeMode="contain"
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNavigation: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingVertical: hp(2),
    paddingHorizontal: wp(4),
    ...getShadowStyles(15),
    justifyContent: 'space-around',
    alignItems: 'center',
    minHeight: hp(9),
    borderTopLeftRadius: getBorderRadius('xlarge'),
    borderTopRightRadius: getBorderRadius('xlarge'),
    borderTopWidth: 2,
    borderTopColor: 'rgba(0, 128, 82, 0.15)',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: getSpacing(0.75),
  },
  activeNavItem: {
    transform: [{ scale: 1.1 }],
  },
  navIconContainer: {
    width: wp(9),
    height: wp(9),
    borderRadius: getBorderRadius('large'),
    backgroundColor: 'rgba(5, 150, 105, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'all 0.3s ease',
  },
  activeNavIconContainer: {
    backgroundColor: 'rgba(5, 150, 105, 0.12)',
  },
  navIcon: {
    ...getIconDimensions('medium'),
    tintColor: '#94a3b8',
  },
  activeNavIcon: {
    tintColor: '#059669',
  },
  cartNavItem: {
    transform: [{ translateY: -hp(2) }],
  },
  activeCartNavItem: {
    transform: [{ translateY: -hp(2) }, { scale: 1.1 }],
  },
  cartIconContainer: {
    width: wp(12),
    height: wp(12),
    borderRadius: getBorderRadius('large'),
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeCartIconContainer: {
    backgroundColor: '#059669',
  },
  cartIcon: {
    ...getIconDimensions('medium'),
    tintColor: '#ffffff',
  },
});

export default BottomNavigation;
