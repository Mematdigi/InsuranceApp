import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Dimensions,
  RefreshControl,
  Animated,
  Platform,
  Image,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Configuration
const API_CONFIG = {
  BASE_URL: 'https://policysaath.com/api', // Emulator IP - Change to your device IP for real device (192.168.1.14:3000)
  ENDPOINTS: {
    FETCH_POLICIES: (customerId: string) =>
      `/v1/customer/customer-fetch-policy/${customerId}`,
  },
};

interface PolicyAction {
  id: string;
  title: string;
  icon: string;
  action: () => void;
}

interface PolicyCard {
  _id: string;
  customerId: string;
  policyNumber: string;
  productName: string;
  policyType: string;
  premiumAmount: string;
  endDate: string;
  status: string;
  policyPeriod?: string;
  tenure?: string;
  nomineeName?: string;
  nomineeRelationship?: string;
}

interface UpdateNotification {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  action: () => void;
}

interface SupportTab {
  id: string;
  title: string;
  icon: string;
  color: string;
  action: () => void;
}

const NewDashboardScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [username, setUsername] = useState('User');
  const [userId, setUserId] = useState<string | null>(null);
  const [policyCards, setPolicyCards] = useState<PolicyCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Animation values for cards
  const [cardAnimations, setCardAnimations] = useState<Animated.Value[]>([]);

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchPolicies();
    }
  }, [userId]);

  // Initialize animations when policy cards change
  useEffect(() => {
    if (policyCards.length > 0) {
      const animations = policyCards.map(() => new Animated.Value(0));
      setCardAnimations(animations);

      // Stagger animation for each card
      const staggerDelay = 200;
      animations.forEach((animation, index) => {
        Animated.timing(animation, {
          toValue: 1,
          duration: 600,
          delay: index * staggerDelay,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [policyCards]);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        const resolvedId = user.id || user._id;
        setUsername(user.username || user.name || 'User');
        setUserId(resolvedId);
      } else if (route.params?.username) {
        setUsername(route.params.username);
      } else {
        // If no user data, navigate to login
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Failed to load user data');
    }
  };

  const fetchPolicies = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);

      if (!userId) {
        setError('User ID not found');
        return;
      }

      console.log('Fetching policies for user ID:', userId);
      const apiUrl = `${API_CONFIG.BASE_URL}/v1/customer/customer-fetch-policy/${userId}`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('API Response status:', response.status);

      if (!response.ok) {
        if (response.status === 404) {
          // No policies found - this is normal for new users
          setPolicyCards([]);
          return;
        }

        // Try to get error message from response
        let errorMessage = `HTTP ${response.status}`;
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } else {
            const textError = await response.text();
            console.error('Non-JSON error response:', textError);
            errorMessage = `Server error (${response.status})`;
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
        }

        throw new Error(errorMessage);
      }

      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Non-JSON response:', textResponse);
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();
      console.log('API Response:', data);

      if (data.policyData && Array.isArray(data.policyData)) {
        setPolicyCards(data.policyData); // Show all policies for vertical layout
        console.log('Policies loaded successfully:', data.policyData.length);
      } else {
        setPolicyCards([]);
        console.log('No policies found in response');
      }
    } catch (error) {
      console.error('Error fetching policies:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to fetch policies',
      );
      setPolicyCards([]);
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPolicies(true);
  };

  // Conditional policy actions based on whether user has policies
  const policyActions: PolicyAction[] =
    policyCards.length === 0
      ? [
          {
            id: '1',
            title: 'Add Policy',
            icon: 'add',
            action: () => navigation.navigate('ChooseCompany'),
          },
          {
            id: '3',
            title: 'View Policy',
            icon: 'document',
            action: () => navigation.navigate('MyPolicy'),
          },
          {
            id: '4',
            title: 'Renew Policy',
            icon: 'refresh',
            action: () => navigation.navigate('DuePayment'),
          },
        ]
      : [
          // Hide "Add Policy" when user has policies
          {
            id: '1',
            title: 'Add Policy',
            icon: 'add',
            action: () => navigation.navigate('ChooseCompany'),
          },
          // {
          //   id: '2',
          //   title: 'Notifications',
          //   icon: '🔔',
          //   action: () => navigation.navigate('Profile')
          // },
          {
            id: '3',
            title: 'View Policy',
            icon: 'document',
            action: () => navigation.navigate('MyPolicy'),
          },
          {
            id: '4',
            title: 'Renew Policy',
            icon: 'refresh',
            action: () => navigation.navigate('DuePayment'),
          },
        ];

  // const importantUpdates: UpdateNotification[] = [
  //   {
  //     id: '1',
  //     title: 'Payment Alerts',
  //     subtitle: 'Payment overdue reminders',
  //     icon: '💳',
  //     color: '#1F9393',
  //     action: () => navigation.navigate('DuePayment')
  //   },
  //   {
  //     id: '2',
  //     title: 'Policy Updates',
  //     subtitle: 'New terms and conditions',
  //     icon: '📄',
  //     color: '#61BACA',
  //     action:() => Alert.alert('Coming Soon')
  //   },
  //   {
  //     id: '3',
  //     title: 'Renewal Notice',
  //     subtitle: 'Policy expiring soon',
  //     icon: '⚠️',
  //     color: '#FFB84D',
  //     action:() => Alert.alert('Coming Soon')
  //   }
  // ];

  // const appsupport: SupportTab[] = [
  //   {
  //     id: '1',
  //     title: "FAQ's",
  //     icon: '❓',
  //     color: '#1F9393',
  //     action: () => navigation.navigate('FAQ')
  //   }
  // ];

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem('user');
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          } catch (error) {
            console.error('Error logging out:', error);
          }
        },
      },
    ]);
  };

  const handlePolicyCardPress = (policy: PolicyCard) => {
    navigation.navigate('PolicyDetails', {
      customerId: policy.customerId,
      policyId: policy._id,
      policyNumber: policy.policyNumber,
    });
  };

  const getCompanyName = (policyType: string) => {
    if (!policyType) return 'Insurance Co.';
    const type = policyType.toLowerCase();
    if (type.includes('hdfc')) return 'HDFC';
    if (type.includes('icici')) return 'ICICI';
    if (type.includes('tata')) return 'TATA';
    if (type.includes('lic')) return 'LIC';
    if (type.includes('bajaj')) return 'BAJAJ';
    return 'Insurance Co.';
  };

  const formatPremium = (amount: string | number) => {
    if (!amount) return '0';
    const numericAmount =
      typeof amount === 'string'
        ? parseInt(amount.replace(/[^0-9]/g, ''))
        : amount;

    if (isNaN(numericAmount)) return '0';

    if (numericAmount >= 100000) {
      return `${(numericAmount / 100000).toFixed(1)}L`;
    }
    if (numericAmount >= 1000) {
      return `${(numericAmount / 1000).toFixed(1)}K`;
    }
    return numericAmount.toString();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    // Handle different date formats from backend
    if (dateString.includes('/')) {
      return dateString; // Already in DD/MM/YYYY format
    }
    if (dateString.includes('-')) {
      // Convert YYYY-MM-DD to DD/MM/YYYY
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    }
    return dateString;
  };

  if (error && !policyCards.length && !loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1F9393" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchPolicies()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const openDialer = async (number: string) => {
    const supported = await Linking.canOpenURL(`tel:${number}`);
    if (supported) {
      Linking.openURL(`tel:${number}`);
    } else {
      Alert.alert('Error', 'Dialer not supported');
    }
  };

  const openFacebook = () => {
    Linking.openURL('https://www.facebook.com/policysaath');
  };
  const openInsta = () => {
    Linking.openURL('https://www.instagram.com/policysaath/');
  };
  const openYoutube = () => {
    Linking.openURL('https://www.youtube.com/@PolicySaath');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F9393" />

      {/* Modern Curved Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <View style={styles.profileCircle}>
              <Text style={styles.profileInitial}>
                {username.charAt(0).toUpperCase()}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.greetingSection}>
            <Text style={styles.greetingText}>Welcome Back</Text>
            <Text style={styles.usernameText}>
              {username.charAt(0).toUpperCase() +
                username.slice(1).toLowerCase()}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => {
              navigation.navigate('Notification');
            }}
          >
            <View style={styles.notificationIcon}>
              {/* <Text style={styles.bellIcon}>🔔</Text> */}
              <FontAwesome name="bell" size={24} color={'#ffffff'} />
              <View style={styles.notificationDot} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Decorative curved elements */}
        <View style={[styles.headerCircle, styles.headerCircle1]} />
        <View style={[styles.headerCircle, styles.headerCircle2]} />
        <View style={[styles.headerCircle, styles.headerCircle3]} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1F9393']}
            tintColor="#1F9393"
          />
        }
      >
        {/* First Time User - Add Policy Tab */}
        {policyCards.length === 0 && !loading && (
          <View style={styles.addPolicyTab}>
            <View style={styles.addPolicyContent}>
              <View style={styles.addPolicyTextSection}>
                <Text style={styles.addPolicyTitle}>
                  Can't See Your Policy?
                </Text>
                <Text style={styles.addPolicySubtitle}>
                  Don't Worry! You Will Be Able To See Your Policy Here In Just
                  A Few Steps
                </Text>
                <TouchableOpacity
                  style={styles.addPolicyButton}
                  onPress={() => navigation.navigate('ChooseCompany')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.addPolicyButtonText}>Add policy</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.addPolicyImageSection}>
                <View style={styles.carContainer}>
                  <View style={styles.carBody}>
                    <View style={styles.carWindows} />
                    <View style={styles.carDoor} />
                  </View>
                  <View style={[styles.carWheel, styles.frontWheel]} />
                  <View style={[styles.carWheel, styles.rearWheel]} />
                </View>
                <View style={styles.personContainer}>
                  <View style={styles.personHead} />
                  <View style={styles.personBody} />
                  <View style={styles.personArm} />
                </View>
                <View style={styles.shieldContainer}>
                  <Text style={styles.shieldIcon}>🛡️</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Policy Actions Card - Only show if user has policies */}
        {policyCards.length > 0 && (
          <View style={styles.policyActionsCard}>
            <Text style={styles.cardTitle}>Policy Actions</Text>

            <View style={styles.actionsGrid}>
              {policyActions.map(action => (
                <TouchableOpacity
                  key={action.id}
                  style={styles.actionItem}
                  onPress={action.action}
                  activeOpacity={0.7}
                >
                  <View style={styles.actionIconContainer}>
                    {/* <Text style={styles.actionIcon}>{action.icon}</Text> */}
                    <Ionicons name={action.icon} size={24} color={'#000000'} />
                  </View>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Your Insurance Section - Only show if user has policies */}
        {policyCards.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Insurance</Text>
              <TouchableOpacity onPress={() => navigation.navigate('MyPolicy')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            {/* Vertical Insurance Cards with Animation */}
            <View style={styles.insuranceCardsVerticalContainer}>
              {loading ? (
                <View style={[styles.insuranceCardVertical, styles.noDataCard]}>
                  <View style={styles.cardBody}>
                    <Text style={styles.noDataText}>Loading...</Text>
                    <Text style={styles.noDataSubtext}>
                      Fetching your policies
                    </Text>
                  </View>
                </View>
              ) : (
                policyCards.map((card, index) => {
                  const animatedStyle = cardAnimations[index]
                    ? {
                        opacity: cardAnimations[index],
                        transform: [
                          {
                            translateY: cardAnimations[index].interpolate({
                              inputRange: [0, 1],
                              outputRange: [50, 0],
                            }),
                          },
                          {
                            scale: cardAnimations[index].interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.8, 1],
                            }),
                          },
                        ],
                      }
                    : {};

                  return (
                    <Animated.View
                      key={card._id || card.policyNumber}
                      style={animatedStyle}
                    >
                      <TouchableOpacity
                        style={styles.insuranceCardVertical}
                        onPress={() => handlePolicyCardPress(card)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.cardHeader}>
                          <View
                            style={[
                              styles.cardStatus,
                              card.status === 'Overdue' && styles.overdueStatus,
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusText,
                                card.status === 'Overdue' &&
                                  styles.overdueStatusText,
                              ]}
                            >
                              {card.status || 'Active'}
                            </Text>
                          </View>
                          <Text style={styles.companyName}>
                            {getCompanyName(card.policyType || '')}
                          </Text>
                          <View style={styles.companyLogo}>
                            <View style={styles.logoCircle} />
                          </View>
                        </View>

                        <View style={styles.cardBody}>
                          <Text style={styles.insuranceType}>
                            {card.policyType || 'Insurance Policy'}
                          </Text>
                          <Text style={styles.insuranceSubType}>
                            {card.productName && card.productName.length > 40
                              ? card.productName.substring(0, 40) + '...'
                              : card.productName || 'Policy Coverage'}
                          </Text>
                        </View>

                        <View style={styles.cardFooter}>
                          <View style={styles.premiumInfo}>
                            <Text style={styles.premiumLabel}>Premium :</Text>
                            <Text style={styles.premiumAmount}>
                              ₹{formatPremium(card.premiumAmount || '0')}
                              <Text style={styles.frequency}> / Year</Text>
                            </Text>
                          </View>
                          <View style={styles.expiryInfo}>
                            <Text style={styles.expiryLabel}>Expires :</Text>
                            <Text style={styles.expiryDate}>
                              {formatDate(card.endDate)}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    </Animated.View>
                  );
                })
              )}
            </View>
          </>
        )}

        {/* Important Updates Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Important Updates</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* <View style={styles.updatesCard}>
          {importantUpdates.map((update, index) => (
            <TouchableOpacity 
              key={update.id} 
              style={[
                styles.updateItem,
                index !== importantUpdates.length - 1 && styles.updateItemBorder
              ]}
              activeOpacity={0.7}
            >
              <View style={styles.updateIcon}>
                <Text style={styles.updateEmoji}>{update.icon}</Text>
              </View>
              <View style={styles.updateContent}>
                <Text style={styles.updateTitle}>{update.title}</Text>
                <Text style={styles.updateSubtitle}>{update.subtitle}</Text>
              </View>
              <Text style={styles.updateArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View> */}

        {/* Personal Alerts Section */}
        <View style={styles.personalAlertsCard}>
          <View style={styles.alertHeader}>
            <View style={styles.alertIconContainer}>
              {/* <Text style={styles.alertIcon}>🔔</Text> */}
              <FontAwesome name="bell" size={24} color={'#000000'} />
            </View>
            <View style={styles.alertInfo}>
              <Text style={styles.alertTitle}>Personal Alerts</Text>
              <Text style={styles.alertSubtitle}>
                Upcoming Birthdays & Anniversaries
              </Text>
            </View>
          </View>
        </View>

        {/* Why You Need Insurance Section */}
        <View style={styles.educationSection}>
          <Text style={styles.educationTitle}>Why you Need Insurance?</Text>

          <View style={styles.educationCard}>
            <View style={styles.educationBackground}>
              {/* Insurance Icons Pattern */}
              <View style={[styles.insuranceIcon, styles.iconHouse]}>
                <Text style={styles.iconText}>🏠</Text>
              </View>
              <View style={[styles.insuranceIcon, styles.iconShield]}>
                <Text style={styles.iconText}>🛡️</Text>
              </View>
              <View style={[styles.insuranceIcon, styles.iconUmbrella]}>
                <Text style={styles.iconText}>☂️</Text>
              </View>
              <View style={[styles.insuranceIcon, styles.iconHeart]}>
                <Text style={styles.iconText}>❤️</Text>
              </View>
              <View style={[styles.insuranceIcon, styles.iconCar]}>
                <Text style={styles.iconText}>🚗</Text>
              </View>
              <View style={[styles.insuranceIcon, styles.iconMoney]}>
                <Text style={styles.iconText}>💰</Text>
              </View>

              {/* Decorative Circles */}
              <View style={[styles.decorativeCircle, styles.circle1]} />
              <View style={[styles.decorativeCircle, styles.circle2]} />
              <View style={[styles.decorativeCircle, styles.circle3]} />
            </View>

            <View style={styles.educationContent}>
              <Text style={styles.educationMainText}>
                Covers you against unexpected expenses
              </Text>
              <Text style={styles.educationSubText}>
                Stay secure when life brings financial shocks
              </Text>

              <TouchableOpacity
                style={styles.exploreButton}
                activeOpacity={0.8}
              >
                <Text style={styles.exploreButtonText}>Explore Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Need Help Section */}
        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>Contact Us!</Text>
          {/* <TouchableOpacity style={styles.chatBotButton} activeOpacity={0.8}>
            <View style={styles.chatBotIcon}>
              <Text style={styles.chatBotEmoji}>🤖</Text>
            </View>
            <Text style={styles.chatBotText}>Chat Bot</Text>
          </TouchableOpacity> */}

          <View style={[styles.chatBotButton]}>
            <TouchableOpacity
              style={{
                backgroundColor: '#1F9393',
                padding: 10,
                borderRadius: 50,
              }}
              onPress={() => {
                openDialer('9136356555');
              }}
            >
              <Feather name="phone" size={24} color={'#fff'} />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: '#1F9393',
                padding: 10,
                borderRadius: 50,
              }}
              onPress={() => {
                openFacebook();
              }}
            >
              <Feather name="facebook" size={24} color={'#fff'} />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: '#1F9393',
                padding: 10,
                borderRadius: 50,
              }}
              onPress={() => {
                openInsta();
              }}
            >
              <Ionicons name="logo-instagram" size={24} color={'#fff'} />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: '#1F9393',
                padding: 10,
                borderRadius: 50,
              }}
              onPress={() => {
                openYoutube();
              }}
            >
              <Feather name="youtube" size={24} color={'#fff'} />
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={{
            marginBottom: 150,
            // justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Image
            source={require('../../assets/images/policy.png')}
            // width={200}
            // height={200}
            style={{ height: 120, width: 120, resizeMode: 'contain' }}
          />
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
          <View style={styles.navIcon}>
            {/* <Text style={styles.navEmoji}>🏠</Text> */}
            <Ionicons name="home" color={'#ffffff'} size={24} />
          </View>
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.navItem}>
          <View style={styles.navIcon}>
          <Text style={styles.navEmoji}>📄</Text>
          </View>
          </TouchableOpacity> */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <View style={[styles.navIcon, { marginTop: 4 }]}>
            {/* <Text style={styles.navEmoji}>👤</Text> */}
            <Ionicons name="person" color={'#000000'} size={24} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={handleLogout}>
          <View style={[styles.navIcon, { marginTop: 4 }]}>
            {/* <Text style={styles.navEmoji}>🚪</Text> */}
            <Ionicons name="log-out" color={'#000000'} size={24} />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9F8',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#1F9393',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#1F9393',
    paddingTop: 50, // Fixed value that works on both emulator and device
    paddingBottom: 40,
    paddingHorizontal: 20,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
    marginTop: 10,
  },
  greetingSection: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  greetingText: {
    color: '#D7EAEE',
    fontSize: 16,
    fontWeight: '500',
  },
  usernameText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  notificationButton: {
    padding: 4,
  },
  notificationIcon: {
    position: 'relative',
  },
  bellIcon: {
    fontSize: 24,
    color: 'white',
  },
  notificationDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF6B6B',
    borderWidth: 2,
    borderColor: 'white',
  },
  headerCircle: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 1000,
  },
  headerCircle1: {
    width: 150,
    height: 150,
    top: -75,
    right: -40,
  },
  headerCircle2: {
    width: 100,
    height: 100,
    bottom: -50,
    left: -20,
  },
  headerCircle3: {
    width: 60,
    height: 60,
    top: 20,
    right: 80,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 165, // Fixed value: 50 (header top) + 55 (content) + 40 (header bottom) + 20 (buffer)
  },
  // Add Policy Tab styles (for first-time users)
  addPolicyTab: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#1F9393',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#1F9393',
  },
  addPolicyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addPolicyTextSection: {
    flex: 1,
    marginRight: 16,
  },
  addPolicyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1893B0',
    marginBottom: 8,
    lineHeight: 24,
  },
  addPolicySubtitle: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 16,
    lineHeight: 20,
  },
  addPolicyButton: {
    backgroundColor: '#1F9393',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
  addPolicyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  addPolicyImageSection: {
    width: 100,
    height: 80,
    position: 'relative',
  },
  policyActionsCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#1F9393',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F9393',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  actionItem: {
    alignItems: 'center',
    flex: 1,
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F9F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionIcon: {
    fontSize: 24,
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F9393',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F9393',
  },
  viewAllText: {
    fontSize: 14,
    color: '#1F9393',
    fontWeight: '600',
  },
  insuranceCardsContainer: {
    paddingRight: 20,
  },
  insuranceCardsScroll: {
    marginBottom: 24,
  },
  insuranceCardsVerticalContainer: {
    marginBottom: 24,
  },
  insuranceCard: {
    width: width * 0.8,
    backgroundColor: '#1F9393',
    borderRadius: 16,
    padding: 20,
    marginRight: 16,
    shadowColor: '#1F9393',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  insuranceCardVertical: {
    width: '100%',
    backgroundColor: '#6FD0CD',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#1F9393',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardStatus: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  overdueStatus: {
    backgroundColor: '#FF6B6B',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  overdueStatusText: {
    color: 'white',
  },
  companyName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  companyLogo: {
    width: 32,
    height: 32,
  },
  logoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff4d',
  },
  cardBody: {
    marginBottom: 20,
  },
  insuranceType: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  insuranceSubType: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  premiumInfo: {
    flex: 1,
  },
  premiumLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginBottom: 4,
  },
  premiumAmount: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  frequency: {
    fontSize: 14,
    fontWeight: '500',
  },
  expiryInfo: {
    alignItems: 'flex-end',
  },
  expiryLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginBottom: 4,
  },
  expiryDate: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  updatesCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#1F9393',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  updateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  updateItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F9F8',
  },
  updateIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F9F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  updateEmoji: {
    fontSize: 20,
  },
  updateContent: {
    flex: 1,
  },
  updateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F9393',
    marginBottom: 4,
  },
  updateSubtitle: {
    fontSize: 14,
    color: '#61BACA',
  },
  updateArrow: {
    fontSize: 24,
    color: '#D7EAEE',
    fontWeight: 'bold',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    // paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    // shadowColor: '#1F9393',
    // shadowOffset: { width: 0, height: -2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 8,
    // elevation: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
  },
  activeNavItem: {
    backgroundColor: '#1F9393',
    borderRadius: 20,
    paddingVertical: 8,
  },
  navIcon: {
    padding: 8,
  },
  navEmoji: {
    fontSize: 24,
  },
  bottomSpacing: {
    // height: 20,
  },
  noDataCard: {
    backgroundColor: '#F0F9F8',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#1F9393',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F9393',
    textAlign: 'center',
    marginBottom: 8,
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#61BACA',
    textAlign: 'center',
  },
  welcomeCard: {
    width: width * 0.9,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginRight: 16,
    shadowColor: '#1F9393',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#E8F6F3',
  },
  welcomeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  welcomeTextSection: {
    flex: 1,
    marginRight: 16,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1893B0',
    marginBottom: 8,
    lineHeight: 24,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 16,
    lineHeight: 20,
  },
  addPoliciesButton: {
    backgroundColor: '#62D2CC',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
  addPoliciesButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  welcomeImageSection: {
    width: 100,
    height: 80,
    position: 'relative',
  },
  carContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 60,
    height: 30,
  },
  carBody: {
    width: 60,
    height: 20,
    backgroundColor: '#9F7AEA',
    borderRadius: 8,
    position: 'relative',
  },
  carWindows: {
    position: 'absolute',
    top: 2,
    left: 4,
    width: 25,
    height: 12,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
  },
  carDoor: {
    position: 'absolute',
    top: 4,
    right: 8,
    width: 20,
    height: 8,
    backgroundColor: '#805AD5',
    borderRadius: 2,
  },
  carWheel: {
    width: 12,
    height: 12,
    backgroundColor: '#2D3748',
    borderRadius: 6,
    position: 'absolute',
    bottom: -6,
  },
  frontWheel: {
    right: 8,
  },
  rearWheel: {
    left: 8,
  },
  personContainer: {
    position: 'absolute',
    bottom: 5,
    right: 0,
    width: 20,
    height: 40,
  },
  personHead: {
    width: 12,
    height: 12,
    backgroundColor: '#F7FAFC',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#4A5568',
    alignSelf: 'center',
  },
  personBody: {
    width: 16,
    height: 20,
    backgroundColor: '#4A5568',
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 2,
  },
  personArm: {
    position: 'absolute',
    right: -4,
    top: 16,
    width: 8,
    height: 3,
    backgroundColor: '#F7FAFC',
    borderRadius: 2,
  },
  shieldContainer: {
    position: 'absolute',
    top: 0,
    right: 45,
    width: 24,
    height: 24,
    backgroundColor: '#E8F6F3',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shieldIcon: {
    fontSize: 14,
  },
  personalAlertsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#1F9393',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F9F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  alertIcon: {
    fontSize: 20,
  },
  alertInfo: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F9393',
    marginBottom: 4,
  },
  alertSubtitle: {
    fontSize: 14,
    color: '#61BACA',
  },
  educationSection: {
    marginBottom: 24,
  },
  educationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F9393',
    marginBottom: 16,
  },
  educationCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 0,
    overflow: 'hidden',
    shadowColor: '#1F9393',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    position: 'relative',
    height: 200,
  },
  educationBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#E8F6F3',
  },
  insuranceIcon: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 16,
  },
  iconHouse: {
    top: 20,
    left: 30,
  },
  iconShield: {
    top: 15,
    right: 80,
  },
  iconUmbrella: {
    top: 60,
    right: 20,
  },
  iconHeart: {
    bottom: 80,
    left: 20,
  },
  iconCar: {
    bottom: 20,
    right: 60,
  },
  iconMoney: {
    bottom: 40,
    left: 80,
  },
  decorativeCircle: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
  },
  circle1: {
    width: 60,
    height: 60,
    top: -30,
    right: -20,
  },
  circle2: {
    width: 40,
    height: 40,
    bottom: -20,
    left: -10,
  },
  circle3: {
    width: 80,
    height: 80,
    top: 40,
    left: -40,
  },
  educationContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  educationMainText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F9393',
    marginBottom: 4,
  },
  educationSubText: {
    fontSize: 14,
    color: '#61BACA',
    marginBottom: 16,
  },
  exploreButton: {
    backgroundColor: '#1F9393',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
  exploreButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  helpSection: {
    marginBottom: 0,
  },
  helpTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F9393',
    marginBottom: 16,
  },
  helpButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  helpButton: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    flex: 0.48,
    shadowColor: '#1F9393',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  helpButtonIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F9F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  helpButtonEmoji: {
    fontSize: 24,
  },
  helpButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F9393',
  },
  chatBotButton: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#1F9393',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  chatBotIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F9F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  chatBotEmoji: {
    fontSize: 24,
  },
  chatBotText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F9393',
  },
  profileButton: {
    padding: 4,
  },
  profileCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#6FD0CD',
    // backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  profileInitial: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default NewDashboardScreen;
