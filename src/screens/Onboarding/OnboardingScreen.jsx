import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import CustomStatusBar, { getStatusBarHeight } from '../../components/CustomStatusBar';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = ({ onSkip, onNavigateToLogin, currentScreen = 1, totalScreens = 1 }) => {
  return (
    <View style={styles.container}>
      <CustomStatusBar backgroundColor="#008052" barStyle="light-content" />
      
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle} numberOfLines={1}>Join The Green Movement</Text>
        <Text style={styles.headerSubtitle}>Reduce • Recycle • Reuse</Text>
      </View>

      {/* Main Content Area */}
      <View style={styles.content}>
        {/* Illustration Area */}
        <View style={styles.illustrationContainer}>
          <Image
            source={require('../../assets/images/onboarding/illustation.png')}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

        {/* Descriptive Text */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>
            Contribute to sustainability with easy,effective
          </Text>
          <Text style={styles.descriptionSecondLine}>
            recycling.
          </Text>
        </View>

        {/* Navigation Indicators */}
        <View style={styles.indicators}>
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navigation}>
          <View style={styles.spacer} />
          <TouchableOpacity style={styles.nextButton} onPress={onNavigateToLogin}>
            <Text style={styles.nextArrow}>→</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#008052',
  },
  header: {
    backgroundColor: '#008052',
    paddingTop: getStatusBarHeight() + Math.max(height * 0.06, 40),
    paddingBottom: Math.max(height * 0.06, 40),
    paddingHorizontal: Math.max(width * 0.05, 20),
  },
  headerTitle: {
    fontSize: Math.max(Math.min(width * 0.06, 26), 20),
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: Math.max(height * 0.02, 15),
    numberOfLines: 1,
  },
  headerSubtitle: {
    fontSize: Math.max(Math.min(width * 0.06, 24), 18),
    color: '#FFFFFF',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: '#E8F5E8',
    borderTopLeftRadius: Math.max(width * 0.08, 30),
    borderTopRightRadius: Math.max(width * 0.08, 30),
    paddingHorizontal: Math.max(width * 0.05, 20),
    paddingTop: Math.max(height * 0.04, 30),
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Math.max(height * 0.01, 10),
  },
  illustration: {
    width: Math.max(Math.min(width * 0.8, 400), 300),
    height: Math.max(Math.min(height * 0.4, 300), 200),
  },
  descriptionContainer: {
    alignItems: 'center',
    marginBottom: Math.max(height * 0.02, 15),
    paddingHorizontal: Math.max(width * 0.05, 20),
  },
  description: {
    fontSize: Math.max(Math.min(width * 0.035, 16), 12),
    color: '#424242',
    textAlign: 'center',
    marginBottom: 2,
  },
  descriptionSecondLine: {
    fontSize: Math.max(Math.min(width * 0.035, 16), 12),
    color: '#424242',
    textAlign: 'center',
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Math.max(height * 0.02, 15),
  },

  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Math.max(height * 0.05, 40),
  },
  spacer: {
    width: Math.max(width * 0.12, 50),
  },
  nextButton: {
    width: Math.max(Math.min(width * 0.15, 60), 50),
    height: Math.max(Math.min(width * 0.15, 60), 50),
    borderRadius: Math.max(Math.min(width * 0.075, 30), 25),
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  nextArrow: {
    fontSize: Math.max(Math.min(width * 0.05, 24), 18),
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
    lineHeight: Math.max(Math.min(width * 0.05, 24), 18),
    marginTop: 7,
  },
});

export default OnboardingScreen;
