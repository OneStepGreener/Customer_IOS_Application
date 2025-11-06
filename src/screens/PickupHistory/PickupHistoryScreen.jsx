import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
  Modal,
  Alert,
} from 'react-native';
import BottomNavigation from '../../components/BottomNavigation';
import CustomStatusBar, { getStatusBarHeight } from '../../components/CustomStatusBar';

const { width, height } = Dimensions.get('window');

const PickupHistoryScreen = ({ onNavigateToProfile, onNavigateToNotifications, onNavigateToClock, onNavigateToFAQ, onNavigateToDashboard, onNavigateToGift, onNavigateToCart }) => {
  // State for status bar color
  const [statusBarColor, setStatusBarColor] = useState('#008052');
  const [statusBarStyle, setStatusBarStyle] = useState('light-content');
  const scrollViewRef = useRef(null);
  
  // Navigation handlers
  const handleDashboardPress = () => {
    console.log('Dashboard pressed from PickupHistoryScreen');
    if (onNavigateToDashboard) {
      onNavigateToDashboard();
    }
  };

  const handleGiftPress = () => {
    console.log('Gift pressed from PickupHistoryScreen');
    if (onNavigateToGift) {
      onNavigateToGift();
    } else {
      console.warn('onNavigateToGift function not provided');
    }
  };

  const handleCartPress = () => {
    console.log('Cart pressed from PickupHistoryScreen');
    if (onNavigateToCart) {
      onNavigateToCart();
    } else {
      console.warn('onNavigateToCart function not provided');
    }
  };

  const handleFaqPress = () => {
    console.log('FAQ pressed from PickupHistoryScreen');
    if (onNavigateToFAQ) {
      onNavigateToFAQ();
    }
  };

  const handleClockPress = () => {
    console.log('Clock pressed from PickupHistoryScreen');
    if (onNavigateToClock) {
      onNavigateToClock();
    }
  };

  // State for filters
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('October 2024');
  
  // State for photo modal
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Demo pickup history data with waste images
  const pickupHistoryData = [
    {
      id: 1,
      date: '15 Oct 2024',
      time: '10:30 AM',
      weight: '25kg',
      status: 'Completed',
      pickupLocation: 'Home',
      photoUrl: 'https://example.com/waste-photo-1.jpg', // This will come from backend
      environmentalImpact: {
        treesSaved: 3,
        waterSaved: '2,500L',
        co2Reduced: '45kg'
      }
    },
    {
      id: 2,
      date: '12 Oct 2024',
      time: '2:15 PM',
      weight: '18kg',
      status: 'Completed',
      pickupLocation: 'Office',
      photoUrl: 'https://example.com/waste-photo-2.jpg', // This will come from backend
      environmentalImpact: {
        treesSaved: 2,
        waterSaved: '1,800L',
        co2Reduced: '32kg'
      }
    },
    {
      id: 3,
      date: '08 Oct 2024',
      time: '9:45 AM',
      weight: '32kg',
      status: 'Completed',
      pickupLocation: 'Home',
      photoUrl: 'https://example.com/waste-photo-3.jpg', // This will come from backend
      environmentalImpact: {
        treesSaved: 4,
        waterSaved: '3,200L',
        co2Reduced: '58kg'
      }
    },
    {
      id: 4,
      date: '05 Oct 2024',
      time: '11:20 AM',
      weight: '22kg',
      status: 'Completed',
      pickupLocation: 'Home',
      photoUrl: 'https://example.com/waste-photo-4.jpg', // This will come from backend
      environmentalImpact: {
        treesSaved: 3,
        waterSaved: '2,200L',
        co2Reduced: '40kg'
      }
    },
    {
      id: 5,
      date: '01 Oct 2024',
      time: '3:30 PM',
      weight: '15kg',
      status: 'Completed',
      pickupLocation: 'Office',
      photoUrl: 'https://example.com/waste-photo-5.jpg', // This will come from backend
      environmentalImpact: {
        treesSaved: 2,
        waterSaved: '1,500L',
        co2Reduced: '27kg'
      }
    },
    {
      id: 6,
      date: '28 Sep 2024',
      time: '10:00 AM',
      weight: '28kg',
      status: 'Completed',
      pickupLocation: 'Home',
      photoUrl: 'https://example.com/waste-photo-6.jpg', // This will come from backend
      environmentalImpact: {
        treesSaved: 4,
        waterSaved: '2,800L',
        co2Reduced: '51kg'
      }
    },
  ];

  // Filter options
  const filterOptions = ['All', 'This Month', 'Last Month', 'This Year'];

  // Month options
  const monthOptions = ['October 2024', 'September 2024', 'August 2024', 'July 2024'];

  // Photo viewing functions
  const handleViewPhoto = (photoUrl) => {
    if (photoUrl) {
      setSelectedPhoto(photoUrl);
      setPhotoModalVisible(true);
    } else {
      Alert.alert('No Photo Available', 'No photo was uploaded for this pickup.');
    }
  };

  const closePhotoModal = () => {
    setPhotoModalVisible(false);
    setSelectedPhoto(null);
  };

  // Handle scroll to change status bar color
  const handleScroll = (event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    const headerHeight = getStatusBarHeight() + Math.max(height * 0.02, 15) + Math.max(height * 0.03, 25) + Math.max(Math.min(width * 0.06, 26), 20) + Math.max(Math.min(width * 0.035, 16), 12) + 20; // Approximate header height
    
    if (scrollY > headerHeight * 0.5) {
      // User has scrolled past half of header, change to white status bar
      setStatusBarColor('#ffffff');
      setStatusBarStyle('dark-content');
    } else {
      // User is at top, keep green status bar
      setStatusBarColor('#008052');
      setStatusBarStyle('light-content');
    }
  };

  const renderPickupItem = ({ item }) => (
    <View style={styles.pickupCard}>
      {/* Content Section */}
      <View style={styles.contentSection}>
        {/* Header with Date and Status */}
        <View style={styles.cardHeader}>
          <View style={styles.dateTimeContainer}>
            <Text style={styles.dateText}>{item.date}</Text>
            <Text style={styles.timeText}>{item.time}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: '#10b981' }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        {/* Pickup Information */}
        <View style={styles.pickupInfo}>
          <View style={styles.pickupIconContainer}>
            <Text style={styles.pickupIcon}>📍</Text>
          </View>
          <View style={styles.pickupDetails}>
            <Text style={styles.pickupLocationTitle}>Pickup Location</Text>
            <Text style={styles.pickupLocationText}>{item.pickupLocation}</Text>
          </View>
        </View>

        {/* Environmental Impact */}
        <View style={styles.impactSection}>
          <Text style={styles.impactTitle}>Environmental Impact</Text>
          <View style={styles.impactGrid}>
            <View style={styles.impactItem}>
              <Text style={styles.impactIcon}>🌳</Text>
              <Text style={styles.impactValue}>{item.environmentalImpact.treesSaved}</Text>
              <Text style={styles.impactLabel}>Trees Saved</Text>
            </View>
            <View style={styles.impactItem}>
              <Text style={styles.impactIcon}>💧</Text>
              <Text style={styles.impactValue}>{item.environmentalImpact.waterSaved}</Text>
              <Text style={styles.impactLabel}>Water Saved</Text>
            </View>
            <View style={styles.impactItem}>
              <Text style={styles.impactIcon}>🌱</Text>
              <Text style={styles.impactValue}>{item.environmentalImpact.co2Reduced}</Text>
              <Text style={styles.impactLabel}>CO₂ Reduced</Text>
            </View>
          </View>
        </View>

        {/* View Photo Button */}
        <View style={styles.photoSection}>
          <TouchableOpacity 
            style={styles.viewPhotoButton}
            onPress={() => handleViewPhoto(item.photoUrl)}
            activeOpacity={0.8}
          >
            <View style={styles.viewPhotoButtonContent}>
              <Text style={styles.viewPhotoIcon}>📸</Text>
              <Text style={styles.viewPhotoText}>View Photo</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <CustomStatusBar backgroundColor={statusBarColor} barStyle={statusBarStyle} />
      
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Pickup History</Text>
              <Text style={styles.headerSubtitle}>Your recycling journey captured</Text>
            </View>
          </View>
        </View>

        {/* Summary Cards */}
        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <View style={styles.summaryIconContainer}>
                <Text style={styles.summaryIcon}>♻️</Text>
              </View>
              <Text style={styles.summaryLabel}>Total Pickups</Text>
              <Text style={styles.summaryValue}>24</Text>
              <Text style={styles.summaryChange}>+12% this month</Text>
            </View>
            <View style={styles.summaryCard}>
              <View style={styles.summaryIconContainer}>
                <Text style={styles.summaryIcon}>🌳</Text>
              </View>
              <Text style={styles.summaryLabel}>Trees Saved</Text>
              <Text style={styles.summaryValue}>18</Text>
              <Text style={styles.summaryChange}>+3 this month</Text>
            </View>
            <View style={styles.summaryCard}>
              <View style={styles.summaryIconContainer}>
                <Text style={styles.summaryIcon}>💧</Text>
              </View>
              <Text style={styles.summaryLabel}>Water Saved</Text>
              <Text style={styles.summaryValue}>14,000L</Text>
              <Text style={styles.summaryChange}>+2,500L this month</Text>
            </View>
          </View>
        </View>

        {/* Filters Section */}
        <View style={styles.filtersSection}>
          <Text style={styles.sectionTitle}>Filter Pickups</Text>
          
          {/* Time Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Time Period</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {filterOptions.map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[styles.filterChip, selectedFilter === filter && styles.selectedFilterChip]}
                  onPress={() => setSelectedFilter(filter)}
                >
                  <Text style={[styles.filterChipText, selectedFilter === filter && styles.selectedFilterChipText]}>
                    {filter}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Month Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Select Month</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {monthOptions.map((month) => (
                <TouchableOpacity
                  key={month}
                  style={[styles.filterChip, selectedMonth === month && styles.selectedFilterChip]}
                  onPress={() => setSelectedMonth(month)}
                >
                  <Text style={[styles.filterChipText, selectedMonth === month && styles.selectedFilterChipText]}>
                    {month}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Pickup History List */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Recent Pickups</Text>
          {pickupHistoryData.map((item, index) => (
            <View key={item.id} style={[styles.pickupCard, index === 0 && styles.firstCard]}>
              {renderPickupItem({ item })}
            </View>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Photo Modal */}
      <Modal
        visible={photoModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closePhotoModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pickup Photo</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={closePhotoModal}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.photoContainer}>
              {selectedPhoto ? (
                <Image
                  source={{ uri: selectedPhoto }}
                  style={styles.photoImage}
                  resizeMode="contain"
                  onError={() => {
                    Alert.alert('Error', 'Failed to load photo. Please try again later.');
                    closePhotoModal();
                  }}
                />
              ) : (
                <View style={styles.noPhotoContainer}>
                  <Text style={styles.noPhotoIcon}>📸</Text>
                  <Text style={styles.noPhotoText}>No photo available</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation Bar */}
      <BottomNavigation
        activeTab="clock"
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
    backgroundColor: '#f8fafc',
  },

  // Header
  header: {
    backgroundColor: '#008052',
    paddingTop: getStatusBarHeight() + Math.max(height * 0.02, 15),
    paddingBottom: Math.max(height * 0.03, 25),
    paddingHorizontal: Math.max(width * 0.05, 20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderBottomLeftRadius: Math.max(width * 0.08, 30),
    borderBottomRightRadius: Math.max(width * 0.08, 30),
    marginBottom: Math.max(height * 0.02, 20),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Math.max(Math.min(width * 0.06, 26), 20),
    color: '#ffffff',
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: Math.max(Math.min(width * 0.035, 16), 12),
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationIcon: {
    width: 20,
    height: 20,
    tintColor: '#ffffff',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },

  // Scroll View
  scrollView: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  // Summary Section
  summarySection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    alignItems: 'center',
  },
  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 128, 82, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryIcon: {
    fontSize: 20,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 18,
    color: '#1e293b',
    fontWeight: '700',
    marginBottom: 2,
  },
  summaryChange: {
    fontSize: 9,
    color: '#10b981',
    fontWeight: '600',
    textAlign: 'center',
  },

  // Filters Section
  filtersSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  filterGroup: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterChip: {
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectedFilterChip: {
    backgroundColor: '#008052',
    borderColor: '#008052',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  selectedFilterChipText: {
    color: '#ffffff',
  },

  // History Section
  historySection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },

  // Pickup Card
  pickupCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  firstCard: {
    marginTop: 8,
  },

  // Image Section
  imageSection: {
    position: 'relative',
    height: 200,
    backgroundColor: '#f1f5f9',
  },
  wasteImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  weightBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  weightText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },

  // Content Section
  contentSection: {
    padding: 20,
  },

  // Card Header
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateTimeContainer: {
    flex: 1,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  timeText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
  },

  // Pickup Information
  pickupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
  },
  pickupIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 128, 82, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pickupIcon: {
    fontSize: 20,
  },
  pickupDetails: {
    flex: 1,
  },
  pickupLocationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 2,
  },
  pickupLocationText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },

  // Environmental Impact
  impactSection: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 16,
  },
  impactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  impactGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  impactItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  impactIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  impactValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  impactLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '500',
    textAlign: 'center',
  },

  // Photo Section
  photoSection: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 16,
    marginTop: 16,
  },
  viewPhotoButton: {
    backgroundColor: '#008052',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#008052',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  viewPhotoButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewPhotoIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  viewPhotoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: width * 0.9,
    maxHeight: height * 0.8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  photoContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  photoImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
  },
  noPhotoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noPhotoIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noPhotoText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },

  bottomSpacer: {
    height: 100,
  },
});

export default PickupHistoryScreen;

