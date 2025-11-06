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

const DashboardScreen = ({ onNavigateToProfile, onNavigateToNotifications, onNavigateToClock, onNavigateToFAQ, onNavigateToGift, onNavigateToCart }) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

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
    ]).start();
  }, []);

  // Navigation handlers with proper error handling
  const handleDashboardPress = () => {
    console.log('Dashboard pressed from DashboardScreen');
    // Already on dashboard, do nothing
  };

  const handleGiftPress = () => {
    console.log('Gift pressed from DashboardScreen');
    if (onNavigateToGift) {
      onNavigateToGift();
    } else {
      console.warn('onNavigateToGift function not provided');
    }
  };

  const handleCartPress = () => {
    console.log('Cart pressed from DashboardScreen');
    if (onNavigateToCart) {
      onNavigateToCart();
    } else {
      console.warn('onNavigateToCart function not provided');
    }
  };

  const handleFaqPress = () => {
    console.log('FAQ pressed from DashboardScreen');
    if (onNavigateToFAQ) {
      onNavigateToFAQ();
    } else {
      console.warn('onNavigateToFAQ function not provided');
    }
  };

  const handleClockPress = () => {
    console.log('Clock pressed from DashboardScreen');
    // Navigate to PickupHistory screen
    if (onNavigateToClock) {
      onNavigateToClock();
    } else {
      console.warn('onNavigateToClock function not provided');
    }
  };

  const [pickupResponse, setPickupResponse] = useState(null);
  const [showPickupCard, setShowPickupCard] = useState(true);
  const [showButtons, setShowButtons] = useState(true);
  const [pickupCardSlideAnim] = useState(new Animated.Value(0));
  const [pickupCardMessage, setPickupCardMessage] = useState('Confirm Your Pickup');
  const [pickupCardDateTime, setPickupCardDateTime] = useState('15th Sep 2025, 10:30 AM');

  // Dynamic Recent Pickups Data
  const recentPickupsData = [
    {
      id: 1,
      date: '12 Oct 2024',
      weight: '18kg',
      status: 'Completed',
      location: 'Office',
      time: '2:15 PM'
    },
    {
      id: 3,
      date: '08 Oct 2024',
      weight: '32kg',
      status: 'Completed',
      location: 'Home',
      time: '9:45 AM'
    },
    {
      id: 4,
      date: '05 Oct 2024',
      weight: '22kg',
      status: 'Completed',
      location: 'Home',
      time: '11:20 AM'
    },
    {
      id: 5,
      date: '01 Oct 2024',
      weight: '15kg',
      status: 'Completed',
      location: 'Office',
      time: '3:30 PM'
    },
    {
      id: 6,
      date: '28 Sep 2024',
      weight: '28kg',
      status: 'Completed',
      location: 'Home',
      time: '10:00 AM'
    },
    {
      id: 7,
      date: '25 Sep 2024',
      weight: '19kg',
      status: 'Completed',
      location: 'Office',
      time: '1:45 PM'
    },
    {
      id: 8,
      date: '22 Sep 2024',
      weight: '31kg',
      status: 'Completed',
      location: 'Home',
      time: '8:30 AM'
    }
  ];

  // Calculate total weight and get latest pickup
  const totalWeight = recentPickupsData.slice(0, 2).reduce((sum, pickup) => sum + parseInt(pickup.weight), 0);
  const latestPickup = recentPickupsData[0];
  const pickupCount = 2;

  const handlePickupResponse = (response) => {
    setPickupResponse(response);
    
    // Set pickup card message and datetime based on response
    switch(response) {
      case 'yes':
        setPickupCardMessage('Thank you for confirming the pickup');
        setPickupCardDateTime('15th Sep 2025, 10:30 AM');
        break;
      case 'no':
        setPickupCardMessage('Pickup canceled');
        setPickupCardDateTime('');
        break;
      case 'next':
        setPickupCardMessage("We'll remind you later");
        setPickupCardDateTime('');
        break;
    }
    
    // Hide buttons immediately when any button is clicked
    setShowButtons(false);
  };

  // Goals cards data
  const goalsData = [
    { 
      id: 1, 
      title: 'Quantity Recycled (kgs)', 
      icon: 'vector', 
      value: '1000', 
      progress: 0.75, 
      color: '#00D4AA',
      gradient: ['#00D4AA', '#00B894'],
      shadowColor: '#00D4AA'
    },
    { 
      id: 2, 
      title: 'Total Trees Saved', 
      icon: 'eco', 
      value: '1000', 
      progress: 0.8, 
      color: '#2ECC71',
      gradient: ['#2ECC71', '#27AE60'],
      shadowColor: '#2ECC71'
    },
    { 
      id: 3, 
      title: 'Total Plastic Recycled', 
      icon: 'local_mall', 
      value: '100kg', 
      progress: 0.6, 
      color: '#3498DB',
      gradient: ['#3498DB', '#2980B9'],
      shadowColor: '#3498DB'
    },
    { 
      id: 4, 
      title: 'CO2 Saved', 
      icon: 'eco', 
      value: '500 kgs', 
      progress: 0.4, 
      color: '#008052',
      gradient: ['#008052', '#006B44'],
      shadowColor: '#008052'
    },
    { 
      id: 5, 
      title: 'Saved Electricity', 
      icon: 'save-energy', 
      value: '500 kWh', 
      progress: 0.85, 
      color: '#F39C12',
      gradient: ['#F39C12', '#E67E22'],
      shadowColor: '#F39C12'
    },
    { 
      id: 6, 
      title: 'Total Water Saved', 
      icon: 'water', 
      value: '1000 L', 
      progress: 0.92, 
      color: '#3498DB',
      gradient: ['#3498DB', '#2980B9'],
      shadowColor: '#3498DB'
    },
  ];

  return (
    <View style={styles.container}>
      <CustomStatusBar backgroundColor="#008052" barStyle="light-content" />
      
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
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.profileButton} onPress={onNavigateToProfile}>
              <View style={styles.profileButtonInner}>
                <Image 
                  source={require('../../assets/images/Profile.png')}
                  style={styles.profileIcon}
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>
            <View style={styles.welcomeText}>
              <Text style={styles.greeting}>Good Morning</Text>
              <Text style={styles.name}>Hi, Welcome Back</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationButton} onPress={onNavigateToNotifications}>
            <View style={styles.notificationButtonInner}>
              <Image 
                source={require('../../assets/images/bell.png')}
                style={styles.notificationIcon}
                resizeMode="contain"
              />
              <View style={styles.notificationBadge} />
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Goals Cards with 3D Effects */}
        <View style={styles.goalsSection}>
          {/* First Row - 3 Cards */}
          <View style={styles.goalsRow}>
            {goalsData.slice(0, 3).map((item, index) => (
              <Animated.View 
                key={item.id} 
                style={[
                  styles.individualGoalCard,
                  {
                    opacity: fadeAnim,
                    transform: [
                      { translateY: slideAnim },
                      { scale: scaleAnim }
                    ]
                  }
                ]}
              >
                <View style={styles.goalCardGradient} />
                <View style={[styles.goalIcon, { backgroundColor: item.color }]}>
                  {item.title === 'Total Trees Saved' ? (
                    <Image 
                      source={require('../../assets/images/tree.png')}
                      style={styles.goalIconImage}
                      resizeMode="contain"
                    />
                  ) : item.icon === 'vector' ? (
                    <Image 
                      source={require('../../assets/images/Vector.png')}
                      style={styles.goalIconImage}
                      resizeMode="contain"
                    />
                  ) : item.icon === 'eco' ? (
                    <Image 
                      source={require('../../assets/images/co2.png')}
                      style={styles.goalIconImage}
                      resizeMode="contain"
                    />
                  ) : item.icon === 'local_mall' ? (
                    <Image 
                      source={require('../../assets/images/local_mall.png')}
                      style={styles.goalIconImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <Text style={styles.goalIconText}>{item.icon}</Text>
                  )}
                </View>
                <Text style={styles.goalTitle}>{item.title}</Text>
                <Text style={styles.goalValue} numberOfLines={1}>{item.value}</Text>
                <View style={styles.goalProgressContainer}>
                  <View style={[styles.goalProgressBar, { width: `${item.progress * 100}%` }]} />
                </View>
              </Animated.View>
            ))}
          </View>
          
          {/* Second Row - 3 Cards */}
          <View style={styles.goalsRow}>
            {goalsData.slice(3, 6).map((item, index) => (
              <Animated.View 
                key={item.id} 
                style={[
                  styles.individualGoalCard,
                  {
                    opacity: fadeAnim,
                    transform: [
                      { translateY: slideAnim },
                      { scale: scaleAnim }
                    ]
                  }
                ]}
              >
                <View style={styles.goalCardGradient} />
                <View style={[styles.goalIcon, { backgroundColor: item.color }]}>
                  {item.title === 'Saved Electricity' ? (
                    <Image 
                      source={require('../../assets/images/save-energy.png')}
                      style={styles.goalIconImage}
                      resizeMode="contain"
                    />
                  ) : item.title === 'Total Water Saved' ? (
                    <Image 
                      source={require('../../assets/images/Expense.png')}
                      style={styles.goalIconImage}
                      resizeMode="contain"
                    />
                  ) : item.icon === 'vector' ? (
                    <Image 
                      source={require('../../assets/images/Vector.png')}
                      style={styles.goalIconImage}
                      resizeMode="contain"
                    />
                  ) : item.icon === 'eco' ? (
                    <Image 
                      source={require('../../assets/images/co2.png')}
                      style={styles.goalIconImage}
                      resizeMode="contain"
                    />
                  ) : item.icon === 'local_mall' ? (
                    <Image 
                      source={require('../../assets/images/local_mall.png')}
                      style={styles.goalIconImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <Text style={styles.goalIconText}>{item.icon}</Text>
                  )}
                </View>
                <Text style={styles.goalTitle}>{item.title}</Text>
                <Text style={styles.goalValue} numberOfLines={1}>{item.value}</Text>
                <View style={styles.goalProgressContainer}>
                  <View style={[styles.goalProgressBar, { width: `${item.progress * 100}%` }]} />
                </View>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Pickup Confirmation Card with 3D */}
        {showPickupCard && (
          <Animated.View 
            style={[
              styles.pickupCard,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { 
                    translateX: pickupCardSlideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, width + 50]
                    })
                  }
                ]
              }
            ]}
          >
            <View style={styles.pickupCardGradient} />
            <View style={styles.pickupHeader}>
              <View style={styles.clockIconContainer}>
                <Image 
                  source={require('../../assets/images/clock.png')}
                  style={styles.clockIcon}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.pickupTextContainer}>
                <Text style={styles.pickupQuestion}>{pickupCardMessage}</Text>
                {pickupCardDateTime ? (
                  <Text style={styles.pickupDateTime} numberOfLines={1}>{pickupCardDateTime}</Text>
                ) : null}
              </View>
            </View>
            {showButtons && (
              <View style={styles.pickupButtons}>
                <TouchableOpacity 
                  style={[
                    styles.pickupButton, 
                    styles.yesButton, 
                    pickupResponse === 'yes' && styles.selectedPickupButton
                  ]}
                  onPress={() => handlePickupResponse('yes')}
                  activeOpacity={0.8}
                >
                  <View style={styles.pickupButtonInner} />
                  <Text style={[
                    styles.pickupButtonText, 
                    pickupResponse === 'yes' && styles.selectedButtonText
                  ]}>
                    ✓ Yes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.pickupButton, 
                    styles.noButton, 
                    pickupResponse === 'no' && styles.selectedPickupButton
                  ]}
                  onPress={() => handlePickupResponse('no')}
                  activeOpacity={0.8}
                >
                  <View style={styles.pickupButtonInner} />
                  <Text style={[
                    styles.pickupButtonText, 
                    pickupResponse === 'no' && styles.selectedButtonText
                  ]}>
                    ✕ No
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.pickupButton, 
                    styles.nextButton, 
                    pickupResponse === 'next' && styles.selectedPickupButton
                  ]}
                  onPress={() => handlePickupResponse('next')}
                  activeOpacity={0.8}
                >
                  <View style={styles.pickupButtonInner} />
                  <Text style={[
                    styles.pickupButtonText, 
                    pickupResponse === 'next' && styles.selectedButtonText
                  ]}>
                    Later
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        )}



        {/* Combined Statistics and Pickups Card with 3D */}
        <Animated.View 
          style={[
            styles.combinedCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.combinedCardGradient} />
          {/* Recent Pickups Section */}
          <View style={styles.combinedSection}>
            <Text style={styles.combinedSectionTitle}>Recent Pickups</Text>
                         <View style={styles.pickupSummaryContent}>
               <View style={styles.checkIconContainer}>
                 <Text style={styles.checkIconText}>✓</Text>
               </View>
               <Text style={styles.pickupSummaryLabel}>Pickups #{pickupCount}</Text>
             </View>
            
            {/* Recent Pickups List */}
            <View style={styles.pickupListContainer}>
              {recentPickupsData.slice(0, 2).map((pickup, index) => (
                <View 
                  key={pickup.id} 
                  style={[
                    styles.modernPickupCard,
                    { 
                      transform: [{ scale: 1 - (index * 0.02) }]
                    }
                  ]}
                >
                  <View style={styles.pickupCardContent}>
                    <View style={styles.pickupCardLeft}>
                      <Text style={styles.pickupCardDate}>{pickup.date}</Text>
                      <Text style={styles.pickupCardLocation}>{pickup.location} • {pickup.time}</Text>
                    </View>
                    <View style={styles.pickupCardRight}>
                      <Text style={styles.pickupCardWeight}>{pickup.weight}</Text>
                      <View style={styles.pickupCardStatus}>
                        <Text style={styles.pickupCardStatusText}>{pickup.status}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <BottomNavigation
        activeTab="dashboard"
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
    backgroundColor: '#F0F8F5',
  },
  
  // Sticky Header with 3D Gradient
  stickyHeader: {
    backgroundColor: '#008052',
    paddingTop: getStatusBarHeight() + hp(2),
    paddingBottom: hp(2),
    paddingHorizontal: wp(5),
    ...getShadowStyles(15),
    borderBottomLeftRadius: getBorderRadius('xlarge'),
    borderBottomRightRadius: getBorderRadius('xlarge'),
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
    backgroundColor: '#008052',
    opacity: 0.9,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileButton: {
    width: wp(11),
    height: wp(11),
    borderRadius: getBorderRadius('large'),
    marginRight: wp(4),
    ...getShadowStyles(8),
  },
  profileButtonInner: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  profileIcon: {
    ...getIconDimensions('medium'),
    tintColor: '#ffffff',
  },
  welcomeText: {
    flex: 1,
  },
  greeting: {
    fontSize: fp(16),
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  name: {
    fontSize: fp(24),
    color: '#ffffff',
    fontWeight: '800',
    marginTop: getSpacing(0.5),
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  notificationButton: {
    width: wp(11),
    height: wp(11),
    borderRadius: getBorderRadius('large'),
    position: 'relative',
    ...getShadowStyles(8),
  },
  notificationButtonInner: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  notificationIcon: {
    ...getIconDimensions('medium'),
    tintColor: '#ffffff',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF6B6B',
    borderWidth: 2,
    borderColor: '#ffffff',
  },

  // Scroll View
  scrollView: {
    flex: 1,
    backgroundColor: '#F0F8F5',
    paddingTop: 10,
  },

  // Goals Section with 3D Cards
  goalsSection: {
    marginTop: getSpacing(2.5),
    paddingHorizontal: getSpacing(2),
  },
  goalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: getSpacing(1.5),
    paddingHorizontal: getSpacing(0.5),
    alignItems: 'stretch',
  },
  goalsRowCentered: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
    gap: 12,
  },
  individualGoalCard: {
    width: '30.5%',
    backgroundColor: '#008052',
    borderRadius: getBorderRadius('large'),
    padding: getSpacing(1.75),
    ...getShadowStyles(12),
    alignItems: 'center',
    justifyContent: 'space-between',
    height: hp(20),
    position: 'relative',
    overflow: 'hidden',
  },
  goalCardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#008052',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  goalIcon: {
    ...getIconDimensions('large'),
    borderRadius: getBorderRadius('large'),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getSpacing(1.5),
    ...getShadowStyles(4),
  },
  goalIconText: {
    fontSize: 24,
  },
  goalIconImage: {
    ...getIconDimensions('medium'),
    tintColor: '#ffffff',
  },
  goalTitle: {
    fontSize: fp(12),
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: getSpacing(0.75),
    lineHeight: fp(14),
    flex: 1,
    justifyContent: 'center',
  },
  goalValue: {
    fontSize: fp(18),
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: getSpacing(1),
    flexWrap: 'nowrap',
    numberOfLines: 1,
  },
  goalProgressContainer: {
    width: '90%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  goalProgressBar: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },

  // Pickup Confirmation Card with 3D
  pickupCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 32,
    padding: 32,
    marginTop: 24,
    marginHorizontal: 16,
    shadowColor: '#00B894',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 20,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 184, 148, 0.2)',
  },
  pickupCardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(0, 184, 148, 0.2)',
  },
  pickupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    zIndex: 1,
  },
  clockIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  clockIcon: {
    width: 28,
    height: 28,
    tintColor: '#00B894',
  },
  pickupTextContainer: {
    flex: 1,
  },
  pickupQuestion: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  pickupDateTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 0.3,
  },
  pickupButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    zIndex: 1,
  },
  pickupButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 48,
    borderWidth: 0,
    minWidth: 80,
  },
  pickupButtonInner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
  },
  yesButton: {
    backgroundColor: '#22C55E',
  },
  noButton: {
    backgroundColor: '#EF4444',
  },
  nextButton: {
    backgroundColor: '#6366F1',
  },
  selectedPickupButton: {
    backgroundColor: '#1F2937',
    transform: [{ scale: 0.98 }],
  },
  pickupButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
    zIndex: 1,
    letterSpacing: 0.2,
  },
  selectedButtonText: {
    color: '#ffffff',
    fontWeight: '800',
  },



  // Check Icon Styles with 3D
  checkIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00B894',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#00B894',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  checkIconText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },

  // Combined Card with 3D
  combinedCard: {
    marginTop: 20,
    marginHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 24,
    shadowColor: '#00B894',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 15,
    position: 'relative',
    overflow: 'hidden',
  },
  combinedCardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  combinedSection: {
    marginBottom: 20,
    zIndex: 1,
  },
  combinedSectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 16,
  },
  pickupSummaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickupSummaryLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  pickupSummaryDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 16,
  },
  pickupSummaryCategory: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  pickupSummaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00B894',
  },

  // Recent Pickups List Styles
  pickupListContainer: {
    marginTop: 16,
  },
  modernPickupCard: {
    marginBottom: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  pickupCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    minHeight: 80,
  },
  pickupCardLeft: {
    flex: 1,
  },
  pickupCardDate: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  pickupCardLocation: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  pickupCardRight: {
    alignItems: 'center',
  },
  pickupCardWeight: {
    fontSize: 20,
    fontWeight: '900',
    color: '#00B894',
    marginBottom: 6,
  },
  pickupCardStatus: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pickupCardStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },

  bottomSpacer: {
    height: 120,
  },
});

export default DashboardScreen;
