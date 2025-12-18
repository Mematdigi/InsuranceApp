import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
  Switch,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface UserProfile {
  name: string;
  username: string;
  email: string;
  contact: string;
  avatar?: string;
}

const ProfileScreen = () => {
  const navigation = useNavigation<any>();
  const { customerId } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    username: '',
    email: '',
    contact: '',
  });

  // Edit form state
  const [editForm, setEditForm] = useState<UserProfile>({
    name: '',
    username: '',
    email: '',
    contact: '',
  });

  const [quickLoginEnabled, setQuickLoginEnabled] = useState(true);

  useEffect(() => {
    // Dismiss any existing alerts when component mounts
    console.log('🔄 Profile screen mounted');

    loadUserProfile();
  }, [customerId]);

  // Add screen focus effect to debug navigation issues
  useFocusEffect(
    React.useCallback(() => {
      console.log('🎯 Profile screen focused');
      return () => {
        console.log('🎯 Profile screen unfocused');
      };
    }, []),
  );

  const loadUserProfile = async () => {
    if (!customerId) return;

    try {
      setIsLoading(true);

      // Try to load from API first
      const response = await fetch(
        `https://policysaath.com/v1/customer/customers/${customerId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      

      if (response.ok) {
        const data = await response.json();
        const profileData = {
          name: data.name || '',
          username:
            data.username ||
            `@${data.name?.toLowerCase().replace(' ', '')}` ||
            '',
          email: data.email || '',
          contact: data.contact || '',
        };

        setUserProfile(profileData);
        setEditForm(profileData);
      } else {
        // Fallback to AsyncStorage if API fails
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          const profileData = {
            name: user.name || 'User',
            username: user.username || '@user',
            email: user.email || '',
            contact: user.contact || user.mobile || user.phone || '',
          };
          setUserProfile(profileData);
          setEditForm(profileData);
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Fallback to AsyncStorage
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          const profileData = {
            name: user.name || 'User',
            username: user.username || '@user',
            email: user.email || '',
            contact: user.contact || user.mobile || user.phone || '',
          };
          setUserProfile(profileData);
          setEditForm(profileData);
        }
      } catch (asyncError) {
        console.error('Error loading from AsyncStorage:', asyncError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Save profile changes
  const saveProfile = async () => {
    if (!customerId) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    // Basic validation
    if (!editForm.name.trim()) {
      Alert.alert('Validation Error', 'Name is required');
      return;
    }

    if (!editForm.email.trim()) {
      Alert.alert('Validation Error', 'Email is required');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editForm.email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return;
    }

    // Mobile validation (if provided)
    if (editForm.contact && editForm.contact.trim()) {
      const contactRegex = /^[0-9]{10}$/;
      if (!contactRegex.test(editForm.contact.replace(/\s/g, ''))) {
        Alert.alert(
          'Validation Error',
          'Please enter a valid 10-digit contact number',
        );
        return;
      }
    }

    try {
      setIsSaving(true);

      const payload = {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        contact: editForm.contact.trim().replace(/\s/g, ''),
      };

      console.log(
        '💾 Saving profile to:',
        `https://policysaath.com/v1/customer/customers/${customerId}`,
      );
      console.log('💾 Payload being sent:', JSON.stringify(payload, null, 2));
      console.log('💾 Customer ID:', customerId);

      const response = await fetch(
        `https://policysaath.com/v1/customer/customers/${customerId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      );

      console.log(response);



      console.log('💾 Response status:', response.status);
      console.log(
        '💾 Response headers:',
        JSON.stringify([...response.headers.entries()]),
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('💾 Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const updatedData = await response.json();
      console.log(updatedData);
      console.log(
        '✅ Profile updated - Response:',
        JSON.stringify(updatedData, null, 2),
      );

      // Update local state
      setUserProfile(editForm);

      // Also save to AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(editForm));

      Alert.alert('Success', 'Profile updated successfully!');
      setActiveTab('profile'); // Switch back to profile view
    } catch (error) {
      console.error('❌ Save profile error:', error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      Alert.alert('Save Error', `Failed to save profile: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMyPolicies = () => {
    navigation.navigate('MyPolicy');
  };

  const handleNominees = () => {
    Alert.alert(
      'Nominees / Dependents',
      'Manage your nominees functionality would be implemented here',
    );
  };

  const handleClaimSecurity = () => {
    Alert.alert(
      'Claim Security',
      'Add extra protection for claims functionality would be implemented here',
    );
  };

  const handleLogout = async () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
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

  const handleHelpSupport = () => {
    Alert.alert(
      'Help & Support',
      'Help and support functionality would be implemented here',
    );
  };

  const handleAboutApp = () => {
    Alert.alert('About App', 'About app information would be shown here');
  };

  const ProfileMenuItem = ({
    icon,
    title,
    subtitle,
    onPress,
    showArrow = true,
    showBadge = false,
    showSwitch = false,
    switchValue = false,
    onSwitchChange,
  }: {
    icon: string;
    title: string;
    subtitle: string;
    onPress: () => void;
    showArrow?: boolean;
    showBadge?: boolean;
    showSwitch?: boolean;
    switchValue?: boolean;
    onSwitchChange?: (value: boolean) => void;
  }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemIcon}>
        {/* <Text style={styles.menuItemIconText}>{icon}</Text> */}
        <Ionicons name={icon} size={24} color={'#000'} />
      </View>
      <View style={styles.menuItemContent}>
        <Text style={styles.menuItemTitle}>{title}</Text>
        <Text style={styles.menuItemSubtitle}>{subtitle}</Text>
      </View>
      <View style={styles.menuItemEnd}>
        {showBadge && <View style={styles.alertBadge} />}
        {showSwitch ? (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ false: '#E2E8F0', true: '#1F9393' }}
            thumbColor={switchValue ? '#ffffff' : '#ffffff'}
            ios_backgroundColor="#E2E8F0"
          />
        ) : showArrow ? (
          <Text style={styles.menuItemArrow}>›</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  const tabs = [
    { id: 'profile', title: 'Profile', icon: '👤' },
    { id: 'edit', title: 'Edit', icon: '✏️' },
    { id: 'workout', title: 'Workout', icon: '💪' },
    { id: 'more', title: 'More', icon: '⚙️' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Profile Card */}
            <View style={styles.profileCard}>
              <View style={styles.profileInfo}>
                <View style={styles.avatarContainer}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {userProfile.name
                        ? userProfile.name.charAt(0).toUpperCase()
                        : 'U'}
                    </Text>
                  </View>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>
                    {userProfile.name || 'No name set'}
                  </Text>
                  <Text style={styles.userHandle}>
                    {userProfile.email || '@user'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setActiveTab('edit')}
              >
                {/* <Text style={styles.editIcon}>✏️</Text> */}
                <Ionicons name='pencil' size={24} color={'#fff'} />
              </TouchableOpacity>
            </View>

            {/* Profile Details */}
            <View style={styles.menuSection}>
              <View style={styles.profileDetail}>
                <Text style={styles.profileDetailLabel}>Email</Text>
                <Text style={styles.profileDetailValue}>
                  {userProfile.email || 'Not set'}
                </Text>
              </View>
              <View style={styles.profileDetail}>
                <Text style={styles.profileDetailLabel}>Contact</Text>
                <Text style={styles.profileDetailValue}>
                  {userProfile.contact || 'Not set'}
                </Text>
              </View>
              {/* <View style={styles.profileDetail}>
                <Text style={styles.profileDetailLabel}>🆔 Customer ID</Text>
                <Text style={styles.profileDetailValue}>{customerId || 'Not available'}</Text>
              </View> */}
            </View>

            {/* Main Menu Section */}
            <View style={styles.menuSection}>
              <ProfileMenuItem
                icon="document"
                title="My Policies"
                subtitle="Manage your insurance policies"
                onPress={handleMyPolicies}
                showBadge={true}
              />

              <ProfileMenuItem
                icon="key"
                title="Quick Login (Face ID / Touch ID)"
                subtitle="Secure & quick access"
                onPress={() => {}}
                showArrow={false}
                showSwitch={true}
                switchValue={quickLoginEnabled}
                onSwitchChange={setQuickLoginEnabled}
              />

              <ProfileMenuItem
                icon="log-out"
                title="Log out"
                subtitle="Further secure your account for safety"
                onPress={handleLogout}
              />
            </View>
          </ScrollView>
        );

      case 'edit':
        return (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.editSection}>
              <Text style={styles.editTitle}>Edit Profile</Text>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Name *</Text>
                <TextInput
                  style={styles.formInput}
                  value={editForm.name}
                  onChangeText={text => {
                    console.log('🔤 Name input changed:', text);
                    setEditForm({ ...editForm, name: text });
                  }}
                  onFocus={() => console.log('🎯 Name input focused')}
                  onBlur={() => console.log('🎯 Name input blurred')}
                  placeholder="Enter your name"
                  placeholderTextColor="#A0B7B3"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Email *</Text>
                <TextInput
                  style={styles.formInput}
                  value={editForm.email}
                  onChangeText={text => {
                    console.log('📧 Email input changed:', text);
                    setEditForm({ ...editForm, email: text });
                  }}
                  onFocus={() => console.log('🎯 Email input focused')}
                  onBlur={() => console.log('🎯 Email input blurred')}
                  placeholder="Enter your email"
                  placeholderTextColor="#A0B7B3"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Contact Number</Text>
                <TextInput
                  style={styles.formInput}
                  value={editForm.contact}
                  onChangeText={text => {
                    console.log('📱 Contact input changed:', text);
                    setEditForm({ ...editForm, contact: text });
                  }}
                  onFocus={() => console.log('🎯 Contact input focused')}
                  onBlur={() => console.log('🎯 Contact input blurred')}
                  placeholder="Enter your contact number"
                  placeholderTextColor="#A0B7B3"
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    console.log('🚫 Cancel button pressed');
                    setEditForm(userProfile);
                    setActiveTab('profile');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.saveButton, isSaving && styles.disabledButton]}
                  onPress={() => {
                    console.log('💾 Save button pressed');
                    saveProfile();
                  }}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        );

      case 'workout':
        return (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.workoutSection}>
              <Text style={styles.sectionTitle}>Workout Plans</Text>
              <View style={styles.comingSoonContainer}>
                <Text style={styles.comingSoonEmoji}>🏋️‍♀️</Text>
                <Text style={styles.comingSoonTitle}>Workout Features</Text>
                <Text style={styles.comingSoonSubtitle}>
                  Coming soon! Track your fitness journey, create workout plans,
                  and monitor your progress.
                </Text>
              </View>
            </View>
          </ScrollView>
        );

      case 'more':
        return (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>More</Text>
            </View>

            <View style={styles.menuSection}>
              <ProfileMenuItem
                icon="help-circle"
                title="Help & Support"
                subtitle=""
                onPress={handleHelpSupport}
              />

              <ProfileMenuItem
                icon="nformation-circle"
                title="About App"
                subtitle=""
                onPress={handleAboutApp}
              />
            </View>
          </ScrollView>
        );

      default:
        return <View />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F9393" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerRight}>
          {isLoading && <ActivityIndicator color="#fff" size="small" />}
        </View>
      </View>

      {/* Tabs */}
      {/* <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.activeTab,
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text
              style={[
                styles.tabText,
                activeTab === tab.id && styles.activeTabText,
              ]}
            >
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View> */}

      {/* Tab Content */}
      <View style={styles.content}>{renderTabContent()}</View>

      <View style={styles.bottomSpacing} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9F8',
  },
  header: {
    backgroundColor: '#1F9393',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  backButton: {
    // padding: 8,
  },
  backArrow: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 40,
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#1F9393',
  },
  tabIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#1F9393',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileCard: {
    backgroundColor: '#1F9393',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#1F9393',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  avatarText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userHandle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: {
    fontSize: 18,
    color: 'white',
  },
  profileDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  profileDetailLabel: {
    fontSize: 14,
    color: '#718096',
  },
  profileDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    flex: 1,
    textAlign: 'right',
  },
  menuSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#1F9393',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F9F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemIconText: {
    fontSize: 18,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 13,
    color: '#718096',
    lineHeight: 18,
  },
  menuItemEnd: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B6B',
    marginRight: 8,
  },
  menuItemArrow: {
    fontSize: 20,
    color: '#CBD5E0',
    fontWeight: 'bold',
  },
  editSection: {
    flex: 1,
  },
  editTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#2D3748',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#1F9393',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#1F9393',
    padding: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#1F9393',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#1F9393',
    padding: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#B0D9D5',
    opacity: 0.7,
  },
  workoutSection: {
    flex: 1,
  },
  comingSoonContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: 'white',
    borderRadius: 16,
    marginTop: 20,
  },
  comingSoonEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  comingSoonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 8,
  },
  comingSoonSubtitle: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    paddingHorizontal: 4,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default ProfileScreen;
