import React from 'react';
import { View, StatusBar, Platform, Dimensions } from 'react-native';
import { getResponsiveDimensions } from '../utils/responsive';

const { width, height } = Dimensions.get('window');

const CustomStatusBar = ({ 
  backgroundColor = '#008052', 
  barStyle = 'light-content',
  translucent = false 
}) => {
  // Calculate status bar height for different devices
  const getStatusBarHeight = () => {
    const { deviceType } = getResponsiveDimensions();
    
    if (Platform.OS === 'ios') {
      switch (deviceType) {
        case 'small':
          return 20; // iPhone SE and older
        case 'medium':
          return 44; // iPhone X, iPhone 12 mini, iPhone 13 mini
        case 'large':
          return 44; // iPhone XS Max, iPhone 11 Pro Max, iPhone 12 Pro Max, iPhone 13 Pro Max
        case 'xlarge':
          return 47; // iPhone 14 Pro Max, iPhone 15 Pro Max
        case 'tablet':
          return 20; // iPad
        default:
          return 44;
      }
    }
    return 0; // Android handles this automatically
  };

  const statusBarHeight = getStatusBarHeight();

  return (
    <View style={{ 
      backgroundColor, 
      height: statusBarHeight,
      width: '100%',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 9999
    }}>
      <StatusBar
        backgroundColor={backgroundColor}
        barStyle={barStyle}
        translucent={translucent}
        animated={true}
      />
    </View>
  );
};

// Export the status bar height calculation function
export const getStatusBarHeight = () => {
  const { deviceType } = getResponsiveDimensions();
  
  if (Platform.OS === 'ios') {
    switch (deviceType) {
      case 'small':
        return 20; // iPhone SE and older
      case 'medium':
        return 44; // iPhone X, iPhone 12 mini, iPhone 13 mini
      case 'large':
        return 44; // iPhone XS Max, iPhone 11 Pro Max, iPhone 12 Pro Max, iPhone 13 Pro Max
      case 'xlarge':
        return 47; // iPhone 14 Pro Max, iPhone 15 Pro Max
      case 'tablet':
        return 20; // iPad
      default:
        return 44;
    }
  }
  return 0;
};

export default CustomStatusBar;
