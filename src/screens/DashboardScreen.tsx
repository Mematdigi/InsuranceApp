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
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { PieChart } from 'react-native-gifted-charts';
import { agentDrawerParamList } from '../navigation/DrawerNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;
type DrawerProps = NativeStackNavigationProp<agentDrawerParamList, 'Dashboard'>;

const DashboardPage: React.FC<Props> = ({ navigation, route }) => {
  // const username = route.params?.username;

  // console.log('Dashboard route params ===>', route.params);
  // const username = route.params?.username ?? 'Guest';

  // console.log(route);
  const nav = useNavigation<DrawerProps>();

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

  const topCustomers = [...insurance]
    .filter(item => item?.policyDetails?.premium)
    .sort(
      (a, b) =>
        Number(b.policyDetails.premium) - Number(a.policyDetails.premium),
    )
    .slice(0, 5);

  // console.log(topCustomers)

  const getNameInitials = (name: string): string => {
    if (!name) return '';

    const parts = name.trim().split(' ').filter(Boolean);

    const firstLetter = parts[0]?.charAt(0).toUpperCase() || '';
    const lastLetter =
      parts.length > 1 ? parts[parts.length - 1].charAt(0).toUpperCase() : '.';

    return `${firstLetter}${lastLetter}`;
  };

  const pieData = [
    { value: 400, color: '#b91a1a' },
    { value: 250, color: '#0e2b57' },
    { value: 200, color: '#f4b340' },
    { value: 102, color: '#ef6a3a' },
    // { value: 400, color: '#b91a1a', text: 'Active' },
    // { value: 250, color: '#0e2b57', text: 'Expired' },
    // { value: 200, color: '#f4b340', text: 'Expired' },
    // { value: 102, color: '#ef6a3a', text: 'Expired' },
  ];

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
          <TouchableOpacity onPress={()=>{
            nav.navigate('AddNewPolicy')
          }}>
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
          <TouchableOpacity
            onPress={() => {
              nav.navigate('ImportPolicy');
            }}
          >
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

        {/* <View style={styles.box}>
          <Text style={styles.manuallyheading}>Overview Breakdown</Text>
          <View style={{ alignItems: 'center' }}>
            <PieChart
              data={pieData}
              radius={100}
              showText
              textColor="white"
              textSize={14}
              focusOnPress
            />
          </View>

          

          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: '#b91a1a' }]} />
              <Text style={styles.legendText}>Within 48 hours</Text>
            </View>

            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: '#0e2b57' }]} />
              <Text style={styles.legendText}>Overdue</Text>
            </View>

            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: '#f4b340' }]} />
              <Text style={styles.legendText}>Due</Text>
            </View>

            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: '#ef6a3a' }]} />
              <Text style={styles.legendText}>Expired</Text>
            </View>
          </View>
        </View> */}

        <View style={styles.box}>
          <Text style={[styles.manuallyheading, { marginBottom: 16 }]}>
            Top Customers
          </Text>

          {topCustomers.map((item, index) => (
            <View
              key={item._id}
              style={[
                // styles.row,
                // {
                //   // justifyContent: 'space-around',
                //   padding: 12,
                //   backgroundColor: '#eee',
                //   borderRadius: 12,
                //   marginBottom: 8,
                //   alignItems:'center',
                // },

                styles.customerRow,
              ]}
            >
              <View
                style={
                  //   {
                  //   padding: 8,
                  //   backgroundColor: Colors.primary,
                  //   borderRadius: 50,
                  // }
                  styles.avatar
                }
              >
                <Text style={styles.avatarText}>
                  {getNameInitials(item.customerName)}
                </Text>
              </View>
              <View style={styles.customerInfo}>
                <Text style={styles.customerName}>{item.customerName}</Text>
                <Text style={styles.company}>{item.company}</Text>
              </View>
              <View style={styles.premiumWrap}>
                <Text style={styles.premium}>
                  ₹{item.policyDetails?.premium ?? 0}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.box}>
          <Text style={[styles.manuallyheading, { marginBottom: 16 }]}>
            Notifications & Alerts
          </Text>

          {/* <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                backgroundColor: '#fff4d5',
                padding: 4,
                borderRadius: 12,
              }}
            >
              <FontAwesome6
                name="triangle-exclamation"
                size={20}
                color={'#ffc107'}
              />
            </View>
            <View>
              <Text>Over Due with 48 hours</Text>
              <Text>0 policies will over due in 48 hours</Text>
            </View>
            <View
              style={{
                backgroundColor: '#fff4d5',
                padding: 4,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: '#a15c07' }}>Attention </Text>
            </View>
          </View> */}

          <View style={[styles.alertRow]}>
            {/* Icon */}
            <View style={styles.alertIconWrap}>
              <FontAwesome6
                name="triangle-exclamation"
                size={18}
                color="#ffc107"
              />
            </View>

            {/* Text */}
            <View style={styles.alertTextWrap}>
              <Text style={styles.alertTitle}>Overdue within 48 hours</Text>
              <Text style={styles.alertDesc}>
                0 policies will overdue in next 48 hours
              </Text>
            </View>

            {/* Badge */}
            <View style={styles.alertBadge}>
              <Text style={styles.alertBadgeText}>Attention</Text>
            </View>
          </View>

          <View style={[styles.alertRow]}>
            {/* Icon */}
            <View
              style={[styles.alertIconWrap, { backgroundColor: '#ffe4e6' }]}
            >
              <FontAwesome name="bell" size={18} color="#be123c" />
            </View>

            {/* Text */}
            <View style={styles.alertTextWrap}>
              <Text style={[styles.alertTitle]}>Policy Renewals</Text>
              <Text style={[styles.alertDesc]}>0 policies expiring soon</Text>
            </View>

            {/* Badge */}
            <View style={[styles.alertBadge, { backgroundColor: '#ffe4e6' }]}>
              <Text style={[styles.alertBadgeText, { color: '#be123c' }]}>
                Due
              </Text>
            </View>
          </View>

          <View style={[styles.alertRow]}>
            {/* Icon */}
            <View
              style={[styles.alertIconWrap, { backgroundColor: '#dcfce7' }]}
            >
              <FontAwesome name="check-circle" size={18} color="#166534" />
            </View>

            {/* Text */}
            <View style={styles.alertTextWrap}>
              <Text style={[styles.alertTitle]}>
                Message & Notification Sent
              </Text>
              <Text style={[styles.alertDesc]}>
                You have 0 notifications today
              </Text>
            </View>

            {/* Badge */}
            <View style={[styles.alertBadge, { backgroundColor: '#dcfce7' }]}>
              <Text style={[styles.alertBadgeText, { color: '#166534' }]}>
                Completed
              </Text>
            </View>
          </View>

          <View style={[styles.alertRow]}>
            {/* Icon */}
            <View
              style={[styles.alertIconWrap, { backgroundColor: '#fee2e2' }]}
            >
              <MaterialIcons name="cancel" size={18} color="#b91c1c" />
            </View>

            {/* Text */}
            <View style={styles.alertTextWrap}>
              <Text style={[styles.alertTitle]}>Expired Policies</Text>
              <Text style={[styles.alertDesc]}>
                6 policies have expired and need attention
              </Text>
            </View>

            {/* Badge */}
            <View style={[styles.alertBadge, { backgroundColor: '#fee2e2' }]}>
              <Text style={[styles.alertBadgeText, { color: '#b91c1c' }]}>
                Expired
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default DashboardPage;

const styles = StyleSheet.create({
  // pieRow: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  // },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%', // 👈 2 items per row
    marginBottom: 10,
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 2,
    marginRight: 6,
  },

  legendText: {
    fontSize: 12,
    color: Colors.text,
  },

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
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    color: '#fff',
    fontWeight: '600',
  },

  customerInfo: {
    flex: 1,
    marginLeft: 12,
  },

  customerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },

  company: {
    fontSize: 12,
    color: Colors.text,
    marginTop: 2,
  },

  premiumWrap: {
    minWidth: 70,
    alignItems: 'flex-end',
  },

  premium: {
    fontSize: 14,
    fontWeight: '600',
    color: '#15803d',
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },

  alertIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff4d5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  alertTextWrap: {
    flex: 1,
    marginHorizontal: 12,
    flexShrink: 1, // 🔑 MOST IMPORTANT
  },

  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },

  alertDesc: {
    fontSize: 12,
    color: Colors.text,
    marginTop: 2,
  },

  alertBadge: {
    backgroundColor: '#fff4d5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    flexShrink: 0, // 🔑 badge ko shrink hone se roke
    // alignSelf: 'flex-start',
  },

  alertBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#a15c07',
  },
});
