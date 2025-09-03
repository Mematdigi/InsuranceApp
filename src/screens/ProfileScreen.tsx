import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

interface UserProfile {
  name: string;
  username: string;
  email: string;
  avatar?: string;
}

const ProfileScreen = () => {
  const navigation = useNavigation<any>();
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Itunuoluwa Abidoye',
    username: '@itunuoluwa',
    email: 'itunu@email.com'
  });
  const [quickLoginEnabled, setQuickLoginEnabled] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setUserProfile({
          name: user.name || 'Itunuoluwa Abidoye',
          username: user.username || '@itunuoluwa',
          email: user.email || 'itunu@email.com'
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const handleMyPolicies = () => {
    navigation.navigate('MyPolicy');
  };

  const handleNominees = () => {
    Alert.alert('Nominees / Dependents', 'Manage your nominees functionality would be implemented here');
  };

  const handleClaimSecurity = () => {
    Alert.alert('Claim Security', 'Add extra protection for claims functionality would be implemented here');
  };

  const handleLogout = async () => {
    Alert.alert(
      'Log out',
      'Are you sure you want to log out?',
      [
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
          }
        }
      ]
    );
  };

  const handleHelpSupport = () => {
    Alert.alert('Help & Support', 'Help and support functionality would be implemented here');
  };

  const handleAboutApp = () => {
    Alert.alert('About App', 'About app information would be shown here');
  };

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Edit profile functionality would be implemented here');
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
    onSwitchChange 
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
        <Text style={styles.menuItemIconText}>{icon}</Text>
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
            trackColor={{ false: '#E2E8F0', true: '#4ECDC4' }}
            thumbColor={switchValue ? '#ffffff' : '#ffffff'}
            ios_backgroundColor="#E2E8F0"
          />
        ) : showArrow ? (
          <Text style={styles.menuItemArrow}>›</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4ECDC4" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{userProfile.name.charAt(0).toUpperCase()}</Text>
              </View>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{userProfile.name}</Text>
              <Text style={styles.userHandle}>{userProfile.username}</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={handleEditProfile}
          >
            <Text style={styles.editIcon}>✏️</Text>
          </TouchableOpacity>
        </View>

        {/* Main Menu Section */}
        <View style={styles.menuSection}>
          <ProfileMenuItem
            icon="📋"
            title="My Policies"
            subtitle="Manage your insurance policies"
            onPress={handleMyPolicies}
            showBadge={true}
          />

          <ProfileMenuItem
            icon="👥"
            title="Nominees / Dependents"
            subtitle="Manage your nominees for claims"
            onPress={handleNominees}
          />

          <ProfileMenuItem
            icon="🔒"
            title="Quick Login (Face ID / Touch ID)"
            subtitle="Secure & quick access"
            onPress={() => {}}
            showArrow={false}
            showSwitch={true}
            switchValue={quickLoginEnabled}
            onSwitchChange={setQuickLoginEnabled}
          />

          <ProfileMenuItem
            icon="🛡️"
            title="Claim Security"
            subtitle="Add extra protection for claims"
            onPress={handleClaimSecurity}
          />

          <ProfileMenuItem
            icon="🚪"
            title="Log out"
            subtitle="Further secure your account for safety"
            onPress={handleLogout}
          />
        </View>

        {/* More Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>More</Text>
        </View>

        <View style={styles.menuSection}>
          <ProfileMenuItem
            icon="❓"
            title="Help & Support"
            subtitle=""
            onPress={handleHelpSupport}
          />

          <ProfileMenuItem
            icon="ℹ️"
            title="About App"
            subtitle=""
            onPress={handleAboutApp}
          />
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 8,
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileCard: {
    backgroundColor: '#4ECDC4',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#4ECDC4',
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
  menuSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#4ECDC4',
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
    height: 40,
  },
});

export default ProfileScreen;