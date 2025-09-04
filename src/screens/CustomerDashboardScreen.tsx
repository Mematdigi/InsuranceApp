import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// Configuration
const API_CONFIG = {
  BASE_URL: 'http://10.0.2.2:5000/api/customers', // Change this to your server URL
  ENDPOINTS: {
    FETCH_POLICIES: (customerId: string) => `/v1/customer/customer-fetch-policy/${customerId}`,
  }
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
  const [username, setUsername] = useState('Rohit Bhardwaj');
  const [policyCards, setPolicyCards] = useState<PolicyCard[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadUserData();
    fetchPolicies();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setUsername(user.username || user.name || 'Rohit Bhardwaj');
      } else if (route.params?.username) {
        setUsername(route.params.username);
      }
    } catch (error) {
      console.log('Error loading user data:', error);
    }
  };

  const fetchPolicies = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (!userData) {
        console.warn('User data not found');
        return;
      }
      
      const user = JSON.parse(userData);
      if (!user?.id) {
        console.warn('User ID not found');
        return;
      }

      console.log('Fetching policies for user ID:', user.id);
      const apiUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FETCH_POLICIES(user.id)}`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (response.ok) {
        const policies = Array.isArray(data.policyData) ? data.policyData : [];
        setPolicyCards(policies.slice(0, 3)); // Show first 3 policies
        console.log('Policies fetched successfully:', policies);
      } else {
        console.warn('Failed to fetch policies:', data.message);
      }
    } catch (error) {
      console.error('Error fetching policies:', error);
    } finally {
      setLoading(false);
    }
  };

  const policyActions: PolicyAction[] = [
    {
      id: '1',
      title: 'Add Policy',
      icon: '📋',
      action: () => navigation.navigate('ChooseCompany')
    },
    {
      id: '2',
      title: 'Notifications',
      icon: '🔔',
      action: () => navigation.navigate('Profile')
    },
    {
      id: '3',
      title: 'View Policy',
      icon: '👁️',
      action: () => navigation.navigate('MyPolicy')
    },
    {
      id: '4',
      title: 'Renew Policy',
      icon: '🔄',
      action: () => navigation.navigate('DuePayments')
    }
  ];

  const importantUpdates: UpdateNotification[] = [
    {
      id: '1',
      title: 'Payment Alerts',
      subtitle: 'Payment overdue reminders',
      icon: '💳',
      color: '#4ECDC4'
    },
    {
      id: '2',
      title: 'Policy Updates',
      subtitle: 'New terms and conditions',
      icon: '📄',
      color: '#61BACA'
    },
    {
      id: '3',
      title: 'Renewal Notice',
      subtitle: 'Policy expiring soon',
      icon: '⚠️',
      color: '#FFB84D'
    }
  ];

  const appsupport: SupportTab[] = [
    {
      id: '1',
      title: "FAQ's",
      icon: '❓',
      color: '#4ECDC4',
      action: () => navigation.navigate('FAQ')
    }
  ];

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
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
              console.log('Error logging out:', error);
            }
          }
        }
      ]
    );
  };

  const handlePolicyCardPress = (policy: PolicyCard) => {
    // Navigate to policy details screen
    navigation.navigate('PolicyDetails', {
      customerId: policy.customerId,
      policyId: policy._id,
      policyNumber: policy.policyNumber
    });
  };

  const getCompanyName = (policyType: string) => {
    if (policyType?.toLowerCase().includes('hdfc')) return 'HDFC';
    if (policyType?.toLowerCase().includes('icici')) return 'ICICI';
    if (policyType?.toLowerCase().includes('tata')) return 'TATA';
    if (policyType?.toLowerCase().includes('lic')) return 'LIC';
    return 'Insurance Co.';
  };

  const formatPremium = (amount: string | number) => {
    const numericAmount = typeof amount === 'string' ? parseInt(amount.replace(/[^0-9]/g, '')) : amount;
    if (numericAmount >= 1000) {
      return `${(numericAmount / 1000).toFixed(1)}K`;
    }
    return numericAmount.toString();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4ECDC4" />
      
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
            <Text style={styles.usernameText}>{username}</Text>
          </View>
          
          <TouchableOpacity style={styles.notificationButton}>
            <View style={styles.notificationIcon}>
              <Text style={styles.bellIcon}>🔔</Text>
              <View style={styles.notificationDot} />
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Decorative curved elements */}
        <View style={[styles.headerCircle, styles.headerCircle1]} />
        <View style={[styles.headerCircle, styles.headerCircle2]} />
        <View style={[styles.headerCircle, styles.headerCircle3]} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Policy Actions Card */}
        <View style={styles.policyActionsCard}>
          <Text style={styles.cardTitle}>Policy Actions</Text>
          
          <View style={styles.actionsGrid}>
            {policyActions.map((action) => (
              <TouchableOpacity 
                key={action.id} 
                style={styles.actionItem}
                onPress={action.action}
              >
                <View style={styles.actionIconContainer}>
                  <Text style={styles.actionIcon}>{action.icon}</Text>
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Your Insurance Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Insurance</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MyPolicy')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* Insurance Cards */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.insuranceCardsContainer}
          style={styles.insuranceCardsScroll}
        >
          {loading ? (
            <View style={[styles.insuranceCard, styles.noDataCard]}>
              <View style={styles.cardBody}>
                <Text style={styles.noDataText}>Loading...</Text>
                <Text style={styles.noDataSubtext}>Fetching your policies</Text>
              </View>
            </View>
          ) : policyCards.length > 0 ? (
            policyCards.map((card) => (
              <TouchableOpacity 
                key={card._id || card.policyNumber} 
                style={styles.insuranceCard}
                onPress={() => handlePolicyCardPress(card)}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardStatus}>
                    <Text style={styles.statusText}>{card.status}</Text>
                  </View>
                  <Text style={styles.companyName}>
                    {getCompanyName(card.policyType || '')}
                  </Text>
                  <View style={styles.companyLogo}>
                    <View style={styles.logoCircle} />
                  </View>
                </View>
                
                <View style={styles.cardBody}>
                  <Text style={styles.insuranceType}>{card.policyType || 'Insurance Policy'}</Text>
                  <Text style={styles.insuranceSubType}>
                    {card.productName ? 
                      (card.productName.length > 25 ? 
                        card.productName.substring(0, 25) + '...' : 
                        card.productName) : 
                      'Policy Coverage'}
                  </Text>
                </View>
                
                <View style={styles.cardFooter}>
                  <View style={styles.premiumInfo}>
                    <Text style={styles.premiumLabel}>Premium :</Text>
                    <Text style={styles.premiumAmount}>
                      ₹{formatPremium(card.premiumAmount || '0')}<Text style={styles.frequency}> / Year</Text>
                    </Text>
                  </View>
                  <View style={styles.expiryInfo}>
                    <Text style={styles.expiryLabel}>Expires :</Text>
                    <Text style={styles.expiryDate}>{card.endDate || 'N/A'}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.welcomeCard}>
              <View style={styles.welcomeContent}>
                <View style={styles.welcomeTextSection}>
                  <Text style={styles.welcomeTitle}>Can't See Your Policy?</Text>
                  <Text style={styles.welcomeSubtitle}>
                    Don't Worry! You Will Be Able To See Your Policy Here In Just A Few Steps
                  </Text>
                  <TouchableOpacity 
                    style={styles.addPolicyButton}
                    onPress={() => navigation.navigate('ChooseCompany')}
                  >
                    <Text style={styles.addPolicyButtonText}>Add policy</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.welcomeImageSection}>
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
        </ScrollView>

        {/* Important Updates Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Important Updates</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.updatesCard}>
          {importantUpdates.map((update, index) => (
            <TouchableOpacity key={update.id} style={[
              styles.updateItem,
              index !== importantUpdates.length - 1 && styles.updateItemBorder
            ]}>
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
        </View>

        {/* Personal Alerts Section */}
        <View style={styles.personalAlertsCard}>
          <View style={styles.alertHeader}>
            <View style={styles.alertIconContainer}>
              <Text style={styles.alertIcon}>🔔</Text>
            </View>
            <View style={styles.alertInfo}>
              <Text style={styles.alertTitle}>Personal Alerts</Text>
              <Text style={styles.alertSubtitle}>Upcoming Birthdays & Anniversaries</Text>
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
              <Text style={styles.educationMainText}>Covers you against unexpected expenses</Text>
              <Text style={styles.educationSubText}>Stay secure when life brings financial shocks</Text>
              
              <TouchableOpacity style={styles.exploreButton}>
                <Text style={styles.exploreButtonText}>Explore Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Need Help Section */}
        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>Need Help !</Text>
          
          <View style={styles.helpButtonsRow}>
            {appsupport.map((support) => (
              <TouchableOpacity 
                key={support.id}
                style={styles.helpButton}
                onPress={support.action}
              >
                <View style={styles.helpButtonIcon}>
                  <Text style={styles.helpButtonEmoji}>{support.icon}</Text>
                </View>
                <Text style={styles.helpButtonText}>{support.title}</Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity style={styles.helpButton}>
              <View style={styles.helpButtonIcon}>
                <Text style={styles.helpButtonEmoji}>💬</Text>
              </View>
              <Text style={styles.helpButtonText}>SMS Us</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.chatBotButton}>
            <View style={styles.chatBotIcon}>
              <Text style={styles.chatBotEmoji}>🤖</Text>
            </View>
            <Text style={styles.chatBotText}>Chat Bot</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
          <View style={styles.navIcon}>
            <Text style={styles.navEmoji}>🏠</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.navIcon}>
            <Text style={styles.navEmoji}>🔍</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.navIcon}>
            <Text style={styles.navEmoji}>👤</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={handleLogout}>
          <View style={styles.navIcon}>
            <Text style={styles.navEmoji}>🗑️</Text>
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
  header: {
    backgroundColor: '#4ECDC4',
    paddingTop: 10,
    paddingBottom: 40,
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
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
    marginTop: -20,
  },
  policyActionsCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4ECDC4',
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
    color: '#4ECDC4',
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
    color: '#4ECDC4',
  },
  viewAllText: {
    fontSize: 14,
    color: '#61BACA',
    fontWeight: '600',
  },
  insuranceCardsContainer: {
    paddingRight: 20,
  },
  insuranceCardsScroll: {
    marginBottom: 24,
  },
  insuranceCard: {
    width: width * 0.8,
    backgroundColor: '#4ECDC4',
    borderRadius: 16,
    padding: 20,
    marginRight: 16,
    shadowColor: '#4ECDC4',
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
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
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
    backgroundColor: 'rgba(255,255,255,0.3)',
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
    shadowColor: '#4ECDC4',
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
    color: '#4ECDC4',
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
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
  },
  activeNavItem: {
    backgroundColor: '#4ECDC4',
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
    height: 20,
  },
  noDataCard: {
    backgroundColor: '#F0F9F8',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4ECDC4',
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
    shadowColor: '#4ECDC4',
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
  addPolicyButton: {
    backgroundColor: '#62D2CC',
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
    shadowColor: '#4ECDC4',
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
    color: '#4ECDC4',
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
    color: '#4ECDC4',
    marginBottom: 16,
  },
  educationCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 0,
    overflow: 'hidden',
    shadowColor: '#4ECDC4',
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
    color: '#4ECDC4',
    marginBottom: 4,
  },
  educationSubText: {
    fontSize: 14,
    color: '#61BACA',
    marginBottom: 16,
  },
  exploreButton: {
    backgroundColor: '#4ECDC4',
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
    marginBottom: 24,
  },
  helpTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4ECDC4',
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
    shadowColor: '#4ECDC4',
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
    color: '#4ECDC4',
  },
  chatBotButton: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginHorizontal: 8,
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
    color: '#4ECDC4',
  },
  profileButton: {
    padding: 4,
  },
  profileCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(255,255,255,0.2)',
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