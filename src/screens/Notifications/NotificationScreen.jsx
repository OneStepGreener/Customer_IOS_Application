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
import { fetchWithTimeout } from '../../utils/apiHelper';

const { width, height } = Dimensions.get('window');

// API Base URL Configuration:
// For iOS Simulator: 'http://localhost:5000'
// For Android Emulator: 'http://10.0.2.2:5000'
// For Physical Device: 'http://YOUR_COMPUTER_IP:5000' (e.g., 'http://192.168.1.100:5000')
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5000'  // ✅ For iOS Simulator - use localhost
  : 'https://your-production-url.com';  // Production URL

const NotificationScreen = ({ onBack, onNavigateToDashboard, onNavigateToGift, onNavigateToCart, onNavigateToFaq, onNavigateToClock, customerId }) => {
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
    if (onNavigateToCart) {
      onNavigateToCart();
    }
  };

  const handleFaqPress = () => {
    console.log('FAQ button pressed in NotificationScreen');
    if (onNavigateToFaq) {
      console.log('Calling onNavigateToFaq function');
      onNavigateToFaq();
    } else {
      console.log('onNavigateToFaq function is not defined');
    }
  };

  const handleClockPress = () => {
    if (onNavigateToClock) {
      onNavigateToClock();
    }
  };
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim1 = useRef(new Animated.Value(0)).current;
  const rotateAnim2 = useRef(new Animated.Value(0)).current;
  const rotateAnim3 = useRef(new Animated.Value(0)).current;

  // Fetch notifications from API
  const fetchNotifications = React.useCallback(async () => {
    if (!customerId) {
      console.warn('No customerId provided, cannot fetch notifications');
      setIsLoading(false);
      return;
    }

    try {
      console.log('📬 Fetching notifications for customer:', customerId);
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/api/notifications?customerId=${customerId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
        60000 // 60 seconds timeout
      );

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        console.log('📬 Notifications fetched:', result.data);
        setNotifications(result.data || []);
      } else {
        console.error('Failed to fetch notifications:', result.message);
        // Keep empty array on error
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Keep empty array on error
      setNotifications([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [customerId]);

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

    // Fetch notifications from API
    fetchNotifications();
  }, [fetchNotifications]);

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

  const handleNotificationPress = async (notificationId) => {
    // Mark notification as read when pressed
    const updatedNotifications = notifications.map(notification => 
      notification.id === notificationId 
        ? { ...notification, isRead: true }
        : notification
    );
    setNotifications(updatedNotifications);

    // Mark as read in backend
    if (customerId && notificationId) {
      try {
        await fetchWithTimeout(
          `${API_BASE_URL}/api/notifications/mark-read`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              customerId: customerId,
              notificationId: notificationId,
            }),
          },
          60000 // 60 seconds timeout
        );
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
  };

  const markAllAsRead = async () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      isRead: true
    }));
    setNotifications(updatedNotifications);

    // Mark all as read in backend
    if (customerId) {
      try {
        await fetchWithTimeout(
          `${API_BASE_URL}/api/notifications/mark-read`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              customerId: customerId,
            }),
          },
          60000 // 60 seconds timeout
        );
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
      }
    }
  };

  const clearAllNotifications = () => {
    // Clear from local state only (backend keeps them for history)
    setNotifications([]);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return '#10b981';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'pickup':
        return '#059669';
      case 'achievement':
        return '#f59e0b';
      case 'reward':
        return '#8b5cf6';
      case 'update':
        return '#0ea5e9';
      case 'impact':
        return '#10b981';
      case 'payment':
        return '#059669';
      default:
        return '#059669';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#008052" barStyle="light-content" />
      
      <ScrollView 
        style={styles.fullScrollContainer} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.fullScrollContent}
      >
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
            <Text style={styles.headerTitle}>Notifications</Text>
          </View>
        </Animated.View>

        {/* Curved Body Content Container */}
        <Animated.View style={[
          styles.curvedBodyContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <View style={styles.loadingSpinner} />
              <Text style={styles.loadingText}>Loading notifications...</Text>
            </View>
          ) : notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIcon}>
                <Text style={styles.emptyStateEmoji}>🔔</Text>
              </View>
              <Text style={styles.emptyStateTitle}>All Clear!</Text>
              <Text style={styles.emptyStateSubtitle}>
                No new notifications. You're all caught up with your eco-journey.
              </Text>
              <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh} disabled={refreshing}>
                <Text style={styles.refreshText}>{refreshing ? 'Refreshing...' : 'Refresh'}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.notificationsList}>
              {/* Quick Actions Header */}
              <View style={styles.quickActionsHeader}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                <View style={styles.quickActions}>
                  <TouchableOpacity style={styles.quickActionButton} onPress={markAllAsRead}>
                    <Text style={styles.quickActionText}>Mark All Read</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.quickActionButtonSecondary} onPress={clearAllNotifications}>
                    <Text style={styles.quickActionTextSecondary}>Clear All</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {notifications.map((notification, index) => (
                <Animated.View
                  key={notification.id}
                  style={[
                    styles.notificationItem,
                    !notification.isRead && styles.unreadItem,
                    {
                      transform: [{
                        translateY: slideAnim.interpolate({
                          inputRange: [0, 50],
                          outputRange: [0, index * 3]
                        })
                      }]
                    }
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => handleNotificationPress(notification.id)}
                    activeOpacity={0.7}
                    style={styles.notificationTouchable}
                  >
                    {/* Unread Indicator */}
                    {!notification.isRead && (
                      <View style={[
                        styles.unreadDot,
                        { backgroundColor: getPriorityColor(notification.priority) }
                      ]} />
                    )}
                    
                    {/* Icon */}
                    <View style={styles.iconWrapper}>
                      <Text style={styles.notificationIcon}>{notification.icon}</Text>
                    </View>
                    
                    {/* Content */}
                    <View style={styles.contentWrapper}>
                      <Text style={[
                        styles.notificationTitle,
                        !notification.isRead && styles.unreadTitle
                      ]}>
                        {notification.title}
                      </Text>
                      <Text style={styles.notificationMessage}>
                        {notification.message}
                      </Text>
                      <Text style={styles.timeStamp}>{notification.time}</Text>
                    </View>
                    

                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          )}
        </Animated.View>
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
    backgroundColor: '#f8fffe',
  },
  
  // Full Page Scroll Container
  fullScrollContainer: {
    flex: 1,
  },
  fullScrollContent: {
    flexGrow: 1,
    paddingBottom: 100, // Space for bottom navigation
  },
  
  // Sticky Header with 3D Effect
  stickyHeader: {
    backgroundColor: '#008052',
    paddingTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight + 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    shadowColor: '#008052',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    marginBottom: 20,
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
  
  // Body Container
  curvedBodyContainer: {
    backgroundColor: '#ffffff',
    flex: 1,
  },
  
  // Loading States
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  loadingSpinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#e6f7f1',
    borderTopColor: '#00a067',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 160, 103, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyStateEmoji: {
    fontSize: 40,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#00a067',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  refreshButton: {
    backgroundColor: '#00a067',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
    shadowColor: '#00a067',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  refreshText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  
  // Notifications List
  notificationsList: {
    flex: 1,
  },
  quickActionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#ffffff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
  },
  quickActionButton: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  quickActionText: {
    fontSize: 11,
    color: '#495057',
    fontWeight: '500',
  },
  quickActionButtonSecondary: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  quickActionTextSecondary: {
    fontSize: 11,
    color: '#dc3545',
    fontWeight: '500',
  },
  
  // LinkedIn-style Notification Items
  notificationItem: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  unreadItem: {
    backgroundColor: '#f8fffe',
    borderLeftWidth: 3,
    borderLeftColor: '#00a067',
  },
  notificationTouchable: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  
  // Unread Dot
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 10,
    marginTop: 4,
  },
  
  // Icon Wrapper
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  notificationIcon: {
    fontSize: 16,
  },
  
  // Content Wrapper
  contentWrapper: {
    flex: 1,
    marginRight: 8,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
    lineHeight: 18,
  },
  unreadTitle: {
    fontWeight: '700',
    color: '#000000',
  },
  notificationMessage: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
    marginBottom: 4,
  },
  timeStamp: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '400',
  },
  

});

export default NotificationScreen;
