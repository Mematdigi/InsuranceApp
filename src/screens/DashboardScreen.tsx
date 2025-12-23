// src/screens/DashboardPage.tsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../constant/Colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

const DashboardPage: React.FC<Props> = ({ navigation, route }) => {
  // const username = route.params?.username;

  // console.log('Dashboard route params ===>', route.params);
  // const username = route.params?.username ?? 'Guest';

  // console.log(route);

  const API_BASE = 'https://www.policysaath.com/api/api/';

  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [insurance, setInsurance] = useState<any[]>([]);

  useEffect(() => {
    getUserData();
  }, []);

  useEffect(() => {
    if (userId) {
      getInsuranceData();
    }
  }, [userId]);

  const getUserData = async () => {
    const user = await AsyncStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      console.log(userData);
      setUserName(userData.name);
      setUserId(userData.id);
    }
  };

  const getInsuranceData = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_BASE}/Insurance-by-Category?insuranceType=Life Insurance&agentId=${userId}`,
      );
      const data = await response.json();
      console.log(data);
      setInsurance(data);
    } catch (err) {
      console.log(err);
    }
  }, [userId]);

  const totalPremiumCollected = insurance.reduce(
    (total, item) => total + Number(item.policyDetails.premium || 0),
    0,
  );

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.row}>
          <View style={[styles.box, { flex: 1 }]}>
            <Text style={styles.boxHeading}>Total Customers</Text>
            <Text style={styles.boxvalue}>{insurance.length}</Text>
          </View>

          <View style={[styles.box, { flex: 1 }]}>
            <Text style={styles.boxHeading}>Premium Collected</Text>
            <Text style={styles.boxvalue}>₹{totalPremiumCollected}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.box, { flex: 1 }]}>
            <Text style={styles.boxHeading}>Premium Due</Text>
            <Text style={styles.boxvalue}>7,444</Text>
          </View>
          <View style={[{ flex: 1 }]}></View>
        </View>

        <View style={[styles.box]}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 16,
              marginBottom: 16,
            }}
          >
            <View style={styles.iconView}>
              <FontAwesome name="user-plus" size={24} color={Colors.white} />
            </View>
            <Text style={styles.manuallyheading}>Add Manually</Text>
          </View>
          <Text style={styles.subtitle}>
            Create a new Customer profile with detailed information.
          </Text>
          <TouchableOpacity>
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '500',
                  color: Colors.primary,
                }}
              >
                Get Started
              </Text>
              <View style={[styles.iconView, { padding: 4 }]}>
                <FontAwesome
                  name="chevron-right"
                  size={16}
                  color={Colors.white}
                />
              </View>
            </View>
          </TouchableOpacity>
        </View>
        <View style={[styles.box]}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 16,
              marginBottom: 16,
            }}
          >
            <View style={styles.iconView}>
              <FontAwesome name="user-plus" size={24} color={Colors.white} />
            </View>
            <Text style={styles.manuallyheading}>Import via Excel</Text>
          </View>
          <Text style={styles.subtitle}>
            Upload and import multiple customer records in bulk.
          </Text>
          <TouchableOpacity>
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '500',
                  color: Colors.primary,
                }}
              >
                Upload File
              </Text>
              <View style={[styles.iconView, { padding: 4 }]}>
                <FontAwesome
                  name="chevron-right"
                  size={16}
                  color={Colors.white}
                />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default DashboardPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 16, // yahin gap de do
  },
  box: {
    backgroundColor: Colors.white,
    elevation: 3,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  boxHeading: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  boxvalue: {
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'center',
  },
  manuallyheading: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  iconView: {
    backgroundColor: Colors.secondary,
    borderRadius: 10,
    padding: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 16,
  },
});
