import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import CustomStatusBar, { getStatusBarHeight } from '../../components/CustomStatusBar';
import { fetchWithTimeout } from '../../utils/apiHelper';


const { width, height } = Dimensions.get('window');

// API Base URL Configuration:
// For iOS Simulator: 'http://localhost:5000'
// For Android Emulator: 'http://10.0.2.2:5000'
// For Physical Device: 'http://YOUR_COMPUTER_IP:5000' (e.g., 'http://192.168.1.100:5000')
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5000'  // ✅ For iOS Simulator - use localhost
  : 'https://your-production-url.com';  // Production URL

const SignupScreen = ({ onBack, onSave, onNavigateToLogin, prefillMobileNumber = '' }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobileNumber: prefillMobileNumber || '',
    houseNumber: '',
    address: '',
    city: '',
    state: '',
    userType: 'Select',
    knowAboutUs: 'Select',
    expectation: '',
    alternateContact: '',
    latitude: null,
    longitude: null,
  });

  const [errors, setErrors] = useState({});
  const [showUserTypeDropdown, setShowUserTypeDropdown] = useState(false);
  const [showKnowAboutUsDropdown, setShowKnowAboutUsDropdown] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update mobile number if prefillMobileNumber changes
  React.useEffect(() => {
    if (prefillMobileNumber) {
      setFormData(prev => ({
        ...prev,
        mobileNumber: prefillMobileNumber
      }));
    }
  }, [prefillMobileNumber]);

  const userTypeOptions = [
    'Household Apartment',
    'School/Institution',
    'Office',
    'Shop',
    'Other'
  ];

  const knowAboutUsOptions = [
    'Referred',
    'Social Media',
    'Other'
  ];



  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUserTypeSelect = (option) => {
    setFormData(prev => ({
      ...prev,
      userType: option
    }));
    setShowUserTypeDropdown(false);
  };

  const handleKnowAboutUsSelect = (option) => {
    setFormData(prev => ({
      ...prev,
      knowAboutUs: option
    }));
    setShowKnowAboutUsDropdown(false);
  };

  // Request location permission for Android
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        // Check if permission is already granted
        const hasPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        
        if (hasPermission) {
          return true;
        }
        
        // Request permission
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location to automatically fill your address details.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'Allow',
          }
        );
        
        console.log('Permission result:', granted);
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Permission request error:', err);
        return false;
      }
    }
    
    // For iOS, permission is handled through Info.plist
    // The user will be prompted automatically when geolocation is accessed
    return true;
  };

  // Get current location and reverse geocode
  const handleCurrentLocation = async () => {
    console.log('handleCurrentLocation called');
    setIsLoadingLocation(true);
    
    try {
      // Request permission first
      const hasPermission = await requestLocationPermission();
      console.log('Location permission result:', hasPermission);
      
      if (!hasPermission) {
        Alert.alert(
          'Location Permission Required', 
          'Please enable location access in your device settings to use this feature.',
          [{ text: 'OK' }]
        );
        setIsLoadingLocation(false);
        return;
      }

      // Get current position with robust timeout handling and fallback
      console.log('Getting current position...');
      
      let position;
      let locationError;
      
      // First attempt: High accuracy
      try {
        position = await new Promise((resolve, reject) => {
          let timeoutId;
          
          timeoutId = setTimeout(() => {
            reject(new Error('High accuracy location request timed out.'));
          }, 25000); // 25 seconds for high accuracy
          
          Geolocation.getCurrentPosition(
            (pos) => {
              clearTimeout(timeoutId);
              console.log('High accuracy location obtained:', pos);
              resolve(pos);
            },
            (error) => {
              clearTimeout(timeoutId);
              console.log('High accuracy location failed:', error);
              reject(error);
            },
            {
              enableHighAccuracy: true,
              timeout: 20000,
              maximumAge: 0,
              distanceFilter: 5,
            }
          );
        });
      } catch (error) {
        console.log('High accuracy failed, trying low accuracy...');
        locationError = error;
        
        // Second attempt: Low accuracy (faster, less precise)
        try {
          position = await new Promise((resolve, reject) => {
            let timeoutId;
            
            timeoutId = setTimeout(() => {
              reject(new Error('Low accuracy location request timed out.'));
            }, 15000); // 15 seconds for low accuracy
            
            Geolocation.getCurrentPosition(
              (pos) => {
                clearTimeout(timeoutId);
                console.log('Low accuracy location obtained:', pos);
                resolve(pos);
              },
              (error) => {
                clearTimeout(timeoutId);
                console.log('Low accuracy location failed:', error);
                reject(error);
              },
              {
                enableHighAccuracy: false,
                timeout: 10000,
                maximumAge: 300000, // 5 minutes old location is OK
                distanceFilter: 50,
              }
            );
          });
        } catch (fallbackError) {
          console.log('Both attempts failed');
          throw locationError || fallbackError;
        }
      }
      
          const { latitude, longitude } = position.coords;
      console.log('📍 Location obtained:', { 
        latitude, 
        longitude, 
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        heading: position.coords.heading,
        speed: position.coords.speed
      });
      
      // Check if location looks like simulator default (Cupertino, CA or Mountain View, CA)
      const isLikelySimulator = (
        (latitude >= 37.3 && latitude <= 37.5 && longitude >= -122.1 && longitude <= -122.0) || // Cupertino, CA
        (latitude >= 37.4 && latitude <= 37.5 && longitude >= -122.1 && longitude <= -122.0)  // Mountain View, CA
      );
      
      if (isLikelySimulator && __DEV__) {
        console.warn('⚠️ SIMULATOR DETECTED: Location appears to be simulator default (California)');
        console.warn('💡 TIP: Set custom location in simulator:');
        console.warn('   iOS: Features → Location → Custom Location');
        console.warn('   Android: Extended Controls (⋮) → Location');
        console.warn('   Gurgaon coordinates: 28.4089, 77.0378');
        console.warn('   Delhi coordinates: 28.6139, 77.2090');
      }
      
      // Check if location is in India but might be showing wrong city
      const isInIndia = (latitude >= 6.0 && latitude <= 37.0 && longitude >= 68.0 && longitude <= 97.0);
      if (isInIndia && __DEV__) {
        console.log('📍 Location is in India');
        console.log(`📍 Coordinates: ${latitude}, ${longitude}`);
        // Gurgaon approximate coordinates: 28.4089, 77.0378
        const gurgaonLat = 28.4089;
        const gurgaonLng = 77.0378;
        const distance = Math.sqrt(
          Math.pow(latitude - gurgaonLat, 2) + Math.pow(longitude - gurgaonLng, 2)
        ) * 111; // Approximate km
        
        if (distance < 20) {
          console.log(`📍 Location is approximately ${Math.round(distance)}km from Gurgaon center`);
        }
      }
      
      // Get exact address using Google API (Reverse Geocoding)
      console.log('🌐 Getting address from Google Maps Geocoding API...');
      console.log(`📍 Coordinates: ${latitude}, ${longitude}`);
      
      const GOOGLE_API_KEY = 'AIzaSyABSofUQpLKthZ_xJAAEONGIPlwe2eKAh0';
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`;
      
      try {
        const response = await fetchWithTimeout(geocodeUrl, {}, 30000); // 30 seconds for Google Maps API
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Google API response status:', data.status);
        console.log('📋 Google API response:', JSON.stringify(data, null, 2));
        
        // Check for API errors
        if (data.status === 'REQUEST_DENIED') {
          console.error('❌ Google API Error: REQUEST_DENIED');
          console.error('Error message:', data.error_message);
          Alert.alert(
            'API Error',
            'Google Maps API access denied. Please check API key configuration.',
            [{ text: 'OK' }]
          );
          setIsLoadingLocation(false);
          return;
        }
        
        if (data.status === 'OVER_QUERY_LIMIT') {
          console.error('❌ Google API Error: OVER_QUERY_LIMIT');
          Alert.alert(
            'API Quota Exceeded',
            'Google Maps API quota exceeded. Please try again later.',
            [{ text: 'OK' }]
          );
          setIsLoadingLocation(false);
          return;
        }
        
        if (data.status === 'INVALID_REQUEST') {
          console.error('❌ Google API Error: INVALID_REQUEST');
          console.error('Error message:', data.error_message);
          Alert.alert(
            'Invalid Request',
            'Invalid coordinates provided to Google Maps API.',
            [{ text: 'OK' }]
          );
          setIsLoadingLocation(false);
          return;
        }
        
        if (data.status === 'ZERO_RESULTS') {
          console.warn('⚠️ Google API: ZERO_RESULTS - No address found for these coordinates');
          Alert.alert(
            'No Address Found',
            'Could not find address for this location. Please enter address manually.',
            [{ text: 'OK' }]
          );
          setIsLoadingLocation(false);
          return;
        }
        
        if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const formattedAddress = result.formatted_address;
        const addressComponents = result.address_components;
        
        console.log('Formatted address:', formattedAddress);
        console.log('Address components:', addressComponents);
        
        // Extract address components
        // Note: Google Maps might return "New Delhi" in formatted_address for Gurgaon locations
        // but the address components will have more specific data (Gurgaon/Gurugram, Haryana)
        let streetNumber = '';
        let route = '';
        let sublocality = '';
        let locality = '';
        let administrativeAreaLevel1 = '';
        let postalCode = '';
        let city = '';
        let district = '';
        
        addressComponents.forEach(component => {
          const types = component.types;
          
          if (types.includes('street_number')) {
            streetNumber = component.long_name;
          } else if (types.includes('route')) {
            route = component.long_name;
          } else if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
            sublocality = component.long_name;
          } else if (types.includes('locality')) {
            locality = component.long_name;
            city = component.long_name; // Primary city name
          } else if (types.includes('administrative_area_level_2')) {
            district = component.long_name; // District (e.g., Gurgaon)
            if (!city) city = component.long_name; // Use district as city if locality not found
          } else if (types.includes('administrative_area_level_1')) {
            administrativeAreaLevel1 = component.long_name; // State (e.g., Haryana)
          } else if (types.includes('postal_code')) {
            postalCode = component.long_name;
          }
        });
        
        // Prioritize Gurgaon/Gurugram over New Delhi if coordinates are in Gurgaon area
        // Gurgaon coordinates range: approximately 28.3-28.6 lat, 77.0-77.2 lng
        const isGurgaonArea = (latitude >= 28.3 && latitude <= 28.6 && longitude >= 77.0 && longitude <= 77.2);
        if (isGurgaonArea && (district.toLowerCase().includes('gurgaon') || district.toLowerCase().includes('gurugram') || 
            locality.toLowerCase().includes('gurgaon') || locality.toLowerCase().includes('gurugram'))) {
          // Use Gurgaon/Gurugram as city instead of New Delhi
          city = district || locality || 'Gurgaon';
          console.log('📍 Detected Gurgaon location, using:', city);
        }
              
        // Update form with exact address and location coordinates
        // Use parsed city (Gurgaon) instead of formatted address city (which might be New Delhi)
        const finalCity = city || locality || district || sublocality || 'Auto-detected';
        const finalState = administrativeAreaLevel1 || 'Auto-detected';
        
        console.log('📍 Parsed Address Components:');
        console.log('   City:', finalCity);
        console.log('   State:', finalState);
        console.log('   District:', district);
        console.log('   Locality:', locality);
        console.log('   Sublocality:', sublocality);
        console.log('   Formatted Address:', formattedAddress);
        
        setFormData(prev => ({
          ...prev,
          houseNumber: streetNumber || '',
          address: formattedAddress, // Keep full formatted address
          city: finalCity, // Use parsed city (Gurgaon) instead of formatted address city
          state: finalState, // Use parsed state (Haryana)
          latitude: latitude,
          longitude: longitude
        }));
        
        // Show success message
        const accuracy = position.coords.accuracy;
        const accuracyMessage = accuracy ? ` (Accuracy: ${Math.round(accuracy)}m)` : '';
        Alert.alert('Success', `Exact address filled automatically!${accuracyMessage}`);
        
        } else {
          console.warn('⚠️ Google API: No results found');
          Alert.alert('Error', 'Could not retrieve address details. Please fill manually.');
        }
      } catch (apiError) {
        console.error('❌ Google API request failed:', apiError);
        Alert.alert(
          'Network Error',
          'Failed to fetch address from Google Maps API. Please check your internet connection and try again.',
          [{ text: 'OK' }]
        );
      }
      
      setIsLoadingLocation(false);
      
          } catch (error) {
        console.error('Location error:', error);
          
          let errorMessage = 'Could not get your current location.';
          
        if (error.message && error.message.includes('timed out')) {
          errorMessage = 'Location request timed out. Please:\n\n• Ensure GPS is enabled\n• Go outdoors or near a window\n• Wait a few seconds and try again\n• Check your internet connection';
        } else if (error.code) {
          switch (error.code) {
            case 1:
              errorMessage = 'Location permission denied. Please enable location access in settings.';
              break;
            case 2:
              errorMessage = 'Location information is unavailable. Please check your GPS settings and ensure you are outdoors or near a window.';
              break;
            case 3:
              errorMessage = 'Location request timed out. Please try again.';
              break;
            default:
              errorMessage = 'An unknown error occurred while getting location.';
          }
        } else {
          errorMessage = error.message || 'Failed to access location. Please try again later.';
          }
          
          Alert.alert('Location Error', errorMessage);
      setIsLoadingLocation(false);
    }
  };



  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateMobile = (mobile) => {
    const mobileRegex = /^[0-9]{10}$/;
    return mobileRegex.test(mobile);
  };

  const validateForm = () => {
    const newErrors = {};

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Mobile validation
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!validateMobile(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number';
    }

    // Address validation
    if (!formData.houseNumber.trim()) {
      newErrors.houseNumber = 'House number is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (formData.userType === 'Select') {
      newErrors.userType = 'Please select user type';
    }

    if (formData.knowAboutUs === 'Select') {
      newErrors.knowAboutUs = 'Please select how you know about us';
    }

    if (!formData.expectation.trim()) {
      newErrors.expectation = 'Estimated waste quantity is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill all required fields correctly.');
      return;
    }

    if (isSubmitting) {
      return; // Prevent multiple submissions
    }

    setIsSubmitting(true);

    try {
      console.log('📤 SignupScreen: Sending signup request...');
      console.log('📤 API URL:', `${API_BASE_URL}/api/signup`);
      console.log('📤 Form Data:', formData);

      const response = await fetchWithTimeout(
        `${API_BASE_URL}/api/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          mobileNumber: formData.mobileNumber.trim(),
          houseNumber: formData.houseNumber.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          userType: formData.userType,
          knowAboutUs: formData.knowAboutUs,
          expectation: formData.expectation.trim(),
          alternateContact: formData.alternateContact.trim() || undefined,
          latitude: formData.latitude,
          longitude: formData.longitude,
        }),
        },
        60000 // 60 seconds timeout
      );

      console.log('📤 Response status:', response.status);

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        // Success - show message that profile is under consideration
        Alert.alert(
          'Account Created',
          'Your profile is under consideration. We will review your application and notify you soon.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate back to login screen
                if (onNavigateToLogin) {
                  onNavigateToLogin();
                }
              },
            },
          ]
        );
      } else {
        // Handle error
        let errorMessage = result.message || 'Failed to create account. Please try again.';
        
        // Handle specific error cases
        if (errorMessage.toLowerCase().includes('already exists')) {
          errorMessage = 'An account with this email or mobile number already exists. Please use a different one or try logging in.';
        }
        
        Alert.alert('Signup Failed', errorMessage, [{ text: 'OK' }]);
      }
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert(
        'Network Error',
        'Unable to connect to server. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomStatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onNavigateToLogin}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Account</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Personal Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={[styles.input, errors.fullName && styles.inputError]}
              value={formData.fullName}
              onChangeText={(value) => handleInputChange('fullName', value)}
              placeholder="Enter your full name"
              placeholderTextColor="#999999"
              autoCapitalize="words"
            />
            {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="Enter your email address"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor="#999999"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mobile Number</Text>
            <View style={[
              styles.phoneInputContainer,
              prefillMobileNumber && styles.phoneInputContainerDisabled
            ]}>
              <View style={[
                styles.countryCodeContainer,
                prefillMobileNumber && styles.countryCodeContainerDisabled
              ]}>
                <Text style={styles.countryCode}>+91</Text>
              </View>
              <TextInput
                style={[
                  styles.phoneInput,
                  errors.mobileNumber && styles.inputError,
                  prefillMobileNumber && styles.phoneInputDisabled
                ]}
                value={formData.mobileNumber}
                onChangeText={(value) => {
                  // Prevent editing if mobile number is pre-filled from OTP
                  if (!prefillMobileNumber) {
                    handleInputChange('mobileNumber', value);
                  }
                }}
                placeholder="Enter 10-digit mobile number"
                keyboardType="phone-pad"
                maxLength={10}
                placeholderTextColor="#999999"
                editable={!prefillMobileNumber}
                selectTextOnFocus={false}
              />
            </View>
            {prefillMobileNumber && (
              <Text style={styles.disabledHintText}>
                Mobile number verified via OTP - cannot be changed
              </Text>
            )}
            {errors.mobileNumber && <Text style={styles.errorText}>{errors.mobileNumber}</Text>}
          </View>
        </View>

        {/* Pickup Address Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pickup Address Details</Text>
          
          <TouchableOpacity 
            style={[styles.currentLocationButton, isLoadingLocation && styles.currentLocationButtonLoading]} 
            onPress={handleCurrentLocation}
            disabled={isLoadingLocation}
          >
            <Text style={styles.mapPinIcon}>{isLoadingLocation ? '⏳' : '📍'}</Text>
            <Text style={styles.currentLocationText}>
              {isLoadingLocation ? 'Getting location...' : 'Use current location'}
            </Text>
            <Text style={styles.arrowIcon}>›</Text>
          </TouchableOpacity>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>House Number</Text>
            <TextInput
              style={[styles.input, errors.houseNumber && styles.inputError]}
              value={formData.houseNumber}
              onChangeText={(value) => handleInputChange('houseNumber', value)}
              placeholder="Enter house/flat number"
              placeholderTextColor="#999999"
            />
            {errors.houseNumber && <Text style={styles.errorText}>{errors.houseNumber}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={[styles.input, errors.address && styles.inputError]}
              value={formData.address}
              onChangeText={(value) => handleInputChange('address', value)}
              placeholder="Enter your complete address"
              placeholderTextColor="#999999"
            />
            {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>City</Text>
            <TextInput
              style={[styles.input, errors.city && styles.inputError]}
              value={formData.city}
              onChangeText={(value) => handleInputChange('city', value)}
              placeholder="Enter your city"
              placeholderTextColor="#999999"
            />
            {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>State</Text>
            <TextInput
              style={[styles.input, errors.state && styles.inputError]}
              value={formData.state}
              onChangeText={(value) => handleInputChange('state', value)}
              placeholder="Enter your state"
              placeholderTextColor="#999999"
            />
            {errors.state && <Text style={styles.errorText}>{errors.state}</Text>}
          </View>
        </View>

        {/* Additional Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Estimated Waste Quantity</Text>
            <View style={styles.weightInputContainer}>
              <TextInput
                style={[styles.weightInput, errors.expectation && styles.inputError]}
                value={formData.expectation}
                onChangeText={(value) => handleInputChange('expectation', value)}
                placeholder="Enter weight"
                placeholderTextColor="#999999"
                keyboardType="decimal-pad"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={styles.unitText}>Kg</Text>
            </View>
            {errors.expectation && <Text style={styles.errorText}>{errors.expectation}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Alternate Contact for Pickup</Text>
            <View style={styles.phoneInputContainer}>
              <View style={styles.countryCodeContainer}>
                <Text style={styles.countryCode}>+91</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                value={formData.alternateContact}
                onChangeText={(value) => handleInputChange('alternateContact', value)}
                placeholder="Enter alternate contact number"
                keyboardType="phone-pad"
                maxLength={10}
                placeholderTextColor="#999999"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>User Type</Text>
            <TouchableOpacity style={[styles.dropdown, errors.userType && styles.inputError]} onPress={() => setShowUserTypeDropdown(!showUserTypeDropdown)}>
              <Text style={[styles.dropdownText, formData.userType === 'Select' && styles.placeholderText]}>{formData.userType}</Text>
              <Text style={[styles.dropdownArrow, showUserTypeDropdown && styles.dropdownArrowUp]}>▼</Text>
            </TouchableOpacity>
            {errors.userType && <Text style={styles.errorText}>{errors.userType}</Text>}
            {showUserTypeDropdown && (
              <View style={styles.dropdownOptions}>
                {userTypeOptions.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.dropdownOption}
                    onPress={() => handleUserTypeSelect(option)}
                  >
                    <Text style={styles.dropdownOptionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>How did you know about Us</Text>
            <TouchableOpacity style={[styles.dropdown, errors.knowAboutUs && styles.inputError]} onPress={() => setShowKnowAboutUsDropdown(!showKnowAboutUsDropdown)}>
              <Text style={[styles.dropdownText, formData.knowAboutUs === 'Select' && styles.placeholderText]}>{formData.knowAboutUs}</Text>
              <Text style={[styles.dropdownArrow, showKnowAboutUsDropdown && styles.dropdownArrowUp]}>▼</Text>
            </TouchableOpacity>
            {errors.knowAboutUs && <Text style={styles.errorText}>{errors.knowAboutUs}</Text>}
            {showKnowAboutUsDropdown && (
              <View style={styles.dropdownOptions}>
                {knowAboutUsOptions.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.dropdownOption}
                    onPress={() => handleKnowAboutUsSelect(option)}
                  >
                    <Text style={styles.dropdownOptionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

              {/* Save Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[
              styles.saveButton, 
              isSubmitting && styles.saveButtonDisabled
            ]} 
            onPress={handleSave}
            disabled={isSubmitting}
          >
            <Text style={styles.saveButtonText}>
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Math.max(width * 0.05, 20),
    paddingVertical: Math.max(height * 0.03, 20),
    paddingTop: getStatusBarHeight() + Math.max(height * 0.02, 15),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    width: Math.max(width * 0.11, 44),
    height: Math.max(width * 0.11, 44),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Math.max(width * 0.055, 22),
    backgroundColor: '#F0F0F0',
  },
  backArrow: {
    fontSize: Math.max(width * 0.05, 20),
    color: '#2E7D32',
    fontWeight: 'bold',
    marginTop: 3,
  },
  headerTitle: {
    fontSize: Math.max(Math.min(width * 0.045, 18), 15),
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  headerSpacer: {
    width: Math.max(width * 0.11, 44),
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: Math.max(width * 0.05, 20),
    paddingTop: Math.max(height * 0.02, 15),
  },
  section: {
    marginTop: Math.max(height * 0.03, 20),
    backgroundColor: '#FFFFFF',
    borderRadius: Math.max(width * 0.04, 16),
    padding: Math.max(width * 0.04, 16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: Math.max(Math.min(width * 0.04, 16), 14),
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: Math.max(height * 0.02, 16),
  },
  inputGroup: {
    marginBottom: Math.max(height * 0.02, 16),
  },
  label: {
    fontSize: Math.max(Math.min(width * 0.035, 14), 12),
    color: '#2E7D32',
    marginBottom: Math.max(height * 0.01, 6),
    fontWeight: '600',
  },
  input: {
    borderWidth: 2,
    borderColor: '#E8E8E8',
    borderRadius: Math.max(width * 0.03, 12),
    paddingHorizontal: Math.max(width * 0.035, 14),
    paddingVertical: Math.max(height * 0.015, 12),
    fontSize: Math.max(Math.min(width * 0.035, 14), 12),
    backgroundColor: '#FFFFFF',
    color: '#2E7D32',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    minHeight: Math.max(height * 0.055, 45),
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: Math.max(width * 0.03, 12),
    borderWidth: 2,
    borderColor: '#E8E8E8',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    minHeight: Math.max(height * 0.055, 45),
  },
  phoneInputContainerDisabled: {
    backgroundColor: '#F5F5F5',
    borderColor: '#D0D0D0',
    opacity: 0.8,
  },
  countryCodeContainer: {
    backgroundColor: '#F1F8E9',
    paddingHorizontal: Math.max(width * 0.03, 12),
    paddingVertical: Math.max(height * 0.015, 12),
    borderRightWidth: 1,
    borderRightColor: '#E8E8E8',
  },
  countryCodeContainerDisabled: {
    backgroundColor: '#E8E8E8',
  },
  countryCode: {
    fontSize: Math.max(Math.min(width * 0.035, 14), 12),
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  phoneInput: {
    flex: 1,
    borderWidth: 0,
    borderRadius: 0,
    paddingHorizontal: Math.max(width * 0.035, 14),
    paddingVertical: Math.max(height * 0.015, 12),
    fontSize: Math.max(Math.min(width * 0.035, 14), 12),
    backgroundColor: 'transparent',
    color: '#2E7D32',
  },
  phoneInputDisabled: {
    backgroundColor: 'transparent',
    color: '#666666',
    opacity: 0.7,
  },
  disabledHintText: {
    fontSize: Math.max(Math.min(width * 0.03, 12), 11),
    color: '#666666',
    fontStyle: 'italic',
    marginTop: Math.max(height * 0.005, 4),
    marginLeft: Math.max(width * 0.01, 4),
  },
  weightInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: Math.max(width * 0.03, 12),
    borderWidth: 2,
    borderColor: '#E8E8E8',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    minHeight: Math.max(height * 0.055, 45),
  },
  weightInput: {
    flex: 1,
    borderWidth: 0,
    borderRadius: 0,
    paddingHorizontal: Math.max(width * 0.035, 14),
    paddingVertical: Math.max(height * 0.015, 12),
    fontSize: Math.max(Math.min(width * 0.035, 14), 12),
    backgroundColor: 'transparent',
    color: '#2E7D32',
  },
  unitText: {
    fontSize: Math.max(Math.min(width * 0.035, 14), 12),
    fontWeight: 'bold',
    color: '#2E7D32',
    paddingHorizontal: Math.max(width * 0.035, 14),
    paddingVertical: Math.max(height * 0.015, 12),
    backgroundColor: '#F1F8E9',
    borderLeftWidth: 1,
    borderLeftColor: '#E8E8E8',
  },
  inputError: {
    borderColor: '#FF6B6B',
    backgroundColor: 'rgba(255, 107, 107, 0.05)',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: Math.max(Math.min(width * 0.03, 12), 11),
    marginTop: Math.max(height * 0.008, 6),
    marginLeft: Math.max(width * 0.01, 4),
    fontWeight: '500',
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F8F9FA',
    marginBottom: height * 0.02,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  currentLocationText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  mapPinIcon: {
    fontSize: 16,
    color: '#2E7D32',
  },
  arrowIcon: {
    fontSize: 18,
    color: '#999999',
    fontWeight: '300',
  },
  currentLocationButtonLoading: {
    backgroundColor: '#E8F5E8',
    borderColor: '#2E7D32',
    opacity: 0.7,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#E8E8E8',
    borderRadius: Math.max(width * 0.03, 12),
    paddingHorizontal: Math.max(width * 0.035, 14),
    paddingVertical: Math.max(height * 0.015, 12),
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    minHeight: Math.max(height * 0.055, 45),
  },
  dropdownText: {
    fontSize: Math.max(Math.min(width * 0.035, 14), 12),
    color: '#2E7D32',
  },
  placeholderText: {
    color: '#999999',
  },
  dropdownArrow: {
    fontSize: Math.max(width * 0.03, 12),
    color: '#2E7D32',
  },
  bottomSpacing: {
    height: height * 0.15,
  },
  buttonContainer: {
    paddingHorizontal: Math.max(width * 0.05, 20),
    paddingVertical: Math.max(height * 0.04, 25),
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: Math.max(width * 0.05, 20),
    borderTopRightRadius: Math.max(width * 0.05, 20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButton: {
    backgroundColor: '#2E7D32',
    borderRadius: Math.max(width * 0.04, 16),
    paddingVertical: Math.max(height * 0.025, 18),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    minHeight: Math.max(height * 0.07, 55),
  },
  saveButtonDisabled: {
    backgroundColor: '#CCCCCC',
    shadowOpacity: 0.1,
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: Math.max(Math.min(width * 0.045, 18), 15),
    fontWeight: 'bold',
  },
  // Dropdown Styles
  dropdownArrowUp: {
    transform: [{ rotate: '180deg' }],
  },
  dropdownOptions: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    marginTop: -1,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownOption: {
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.015,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownOptionText: {
    fontSize: Math.max(width * 0.03, 12),
    color: '#000000',
  },
});

export default SignupScreen;


