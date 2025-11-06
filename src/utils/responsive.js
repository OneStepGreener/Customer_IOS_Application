import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (iPhone 12/13/14 - 390x844)
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

// Device type detection
export const getDeviceType = () => {
  const aspectRatio = SCREEN_HEIGHT / SCREEN_WIDTH;
  
  if (SCREEN_WIDTH <= 320) {
    return 'small'; // iPhone SE, older phones
  } else if (SCREEN_WIDTH <= 375) {
    return 'medium'; // iPhone 8, iPhone X
  } else if (SCREEN_WIDTH <= 414) {
    return 'large'; // iPhone 8 Plus, iPhone XR
  } else if (SCREEN_WIDTH <= 428) {
    return 'xlarge'; // iPhone 12/13/14 Pro Max
  } else {
    return 'tablet'; // iPad and larger devices
  }
};

// Responsive width calculation
export const wp = (percentage) => {
  const value = (percentage * SCREEN_WIDTH) / 100;
  return Math.round(value);
};

// Responsive height calculation
export const hp = (percentage) => {
  const value = (percentage * SCREEN_HEIGHT) / 100;
  return Math.round(value);
};

// Responsive font size
export const fp = (size) => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size * scale;
  
  // Ensure minimum font size for readability
  const minSize = size * 0.8;
  const maxSize = size * 1.3;
  
  return Math.max(minSize, Math.min(maxSize, newSize));
};

// Responsive padding/margin
export const rp = (size) => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  return Math.round(size * scale);
};

// Get responsive dimensions
export const getResponsiveDimensions = () => {
  const deviceType = getDeviceType();
  
  return {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    deviceType,
    isSmallDevice: deviceType === 'small',
    isMediumDevice: deviceType === 'medium',
    isLargeDevice: deviceType === 'large',
    isXLargeDevice: deviceType === 'xlarge',
    isTablet: deviceType === 'tablet',
    isIOS: Platform.OS === 'ios',
    isAndroid: Platform.OS === 'android',
  };
};

// Responsive grid calculations
export const getGridDimensions = (columns = 3, spacing = 16) => {
  const totalSpacing = spacing * (columns - 1);
  const availableWidth = SCREEN_WIDTH - (spacing * 2) - totalSpacing; // Account for container padding
  const itemWidth = availableWidth / columns;
  
  return {
    itemWidth: Math.floor(itemWidth),
    spacing,
    columns,
  };
};

// Responsive card dimensions
export const getCardDimensions = (type = 'default') => {
  const deviceType = getDeviceType();
  
  switch (type) {
    case 'small':
      return {
        width: wp(28),
        height: hp(18),
        borderRadius: rp(12),
        padding: rp(12),
      };
    case 'medium':
      return {
        width: wp(30),
        height: hp(20),
        borderRadius: rp(16),
        padding: rp(16),
      };
    case 'large':
      return {
        width: wp(32),
        height: hp(22),
        borderRadius: rp(20),
        padding: rp(20),
      };
    default:
      return {
        width: wp(30),
        height: hp(20),
        borderRadius: rp(16),
        padding: rp(16),
      };
  }
};

// Responsive button dimensions
export const getButtonDimensions = (type = 'default') => {
  const deviceType = getDeviceType();
  
  switch (type) {
    case 'small':
      return {
        height: hp(5),
        paddingHorizontal: rp(16),
        borderRadius: rp(12),
        fontSize: fp(14),
      };
    case 'medium':
      return {
        height: hp(6),
        paddingHorizontal: rp(20),
        borderRadius: rp(16),
        fontSize: fp(16),
      };
    case 'large':
      return {
        height: hp(7),
        paddingHorizontal: rp(24),
        borderRadius: rp(20),
        fontSize: fp(18),
      };
    default:
      return {
        height: hp(6),
        paddingHorizontal: rp(20),
        borderRadius: rp(16),
        fontSize: fp(16),
      };
  }
};

// Responsive icon dimensions
export const getIconDimensions = (size = 'medium') => {
  const deviceType = getDeviceType();
  
  switch (size) {
    case 'small':
      return {
        width: rp(16),
        height: rp(16),
      };
    case 'medium':
      return {
        width: rp(24),
        height: rp(24),
      };
    case 'large':
      return {
        width: rp(32),
        height: rp(32),
      };
    case 'xlarge':
      return {
        width: rp(40),
        height: rp(40),
      };
    default:
      return {
        width: rp(24),
        height: rp(24),
      };
  }
};

// Responsive spacing
export const getSpacing = (multiplier = 1) => {
  const baseSpacing = 8;
  return rp(baseSpacing * multiplier);
};

// Responsive border radius
export const getBorderRadius = (size = 'medium') => {
  switch (size) {
    case 'small':
      return rp(8);
    case 'medium':
      return rp(12);
    case 'large':
      return rp(16);
    case 'xlarge':
      return rp(24);
    default:
      return rp(12);
  }
};

// Safe area calculations
export const getSafeAreaInsets = () => {
  const deviceType = getDeviceType();
  
  return {
    top: Platform.OS === 'ios' ? (deviceType === 'small' ? 20 : 44) : 0,
    bottom: Platform.OS === 'ios' ? (deviceType === 'small' ? 20 : 34) : 0,
    left: 0,
    right: 0,
  };
};

// Responsive text styles
export const getTextStyles = () => {
  return {
    h1: {
      fontSize: fp(32),
      lineHeight: fp(40),
      fontWeight: '800',
    },
    h2: {
      fontSize: fp(28),
      lineHeight: fp(36),
      fontWeight: '700',
    },
    h3: {
      fontSize: fp(24),
      lineHeight: fp(32),
      fontWeight: '700',
    },
    h4: {
      fontSize: fp(20),
      lineHeight: fp(28),
      fontWeight: '600',
    },
    body: {
      fontSize: fp(16),
      lineHeight: fp(24),
      fontWeight: '400',
    },
    caption: {
      fontSize: fp(14),
      lineHeight: fp(20),
      fontWeight: '400',
    },
    small: {
      fontSize: fp(12),
      lineHeight: fp(16),
      fontWeight: '400',
    },
  };
};

// Responsive shadow styles
export const getShadowStyles = (elevation = 4) => {
  const deviceType = getDeviceType();
  
  return {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: elevation / 2,
    },
    shadowOpacity: 0.1 + (elevation * 0.02),
    shadowRadius: elevation,
    elevation: elevation,
  };
};

export default {
  wp,
  hp,
  fp,
  rp,
  getDeviceType,
  getResponsiveDimensions,
  getGridDimensions,
  getCardDimensions,
  getButtonDimensions,
  getIconDimensions,
  getSpacing,
  getBorderRadius,
  getSafeAreaInsets,
  getTextStyles,
  getShadowStyles,
};

