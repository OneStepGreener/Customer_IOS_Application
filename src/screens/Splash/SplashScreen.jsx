import React, { useEffect, useState } from 'react';
import {
  View,
  ImageBackground,
  StyleSheet,
  Dimensions,
} from 'react-native';
import CustomStatusBar, { getStatusBarHeight } from '../../components/CustomStatusBar';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ onSplashComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onSplashComplete) {
        onSplashComplete();
      }
    }, 2000); // 2 seconds

    return () => clearTimeout(timer);
  }, [onSplashComplete]);

  if (!isVisible) {
    return null;
  }

  return (
    <View style={styles.container}>
      <CustomStatusBar backgroundColor="transparent" barStyle="light-content" />
      <ImageBackground
        source={require('../../assets/images/splash/splash-screen.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    marginTop: -getStatusBarHeight(), // Extend to status bar
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SplashScreen;
