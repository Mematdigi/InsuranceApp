import React from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../constant/Colors';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type props = NativeStackScreenProps<RootStackParamList, 'SelectInsurance'>;

const SelectInsuranceScreen: React.FC<props> = ({ navigation, route }) => {
  return (
    // <View style={styles.container}>
    //   <Text style={styles.title}>Select Your Insurance</Text>
    //   {/* You can add logic to select the insurance here */}
    //   <Button
    //     title="Go to Dashboard"
    //     onPress={() => navigation.navigate('Dashboard', { username: 'User' })}
    //   />
    // </View>

    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle={'dark-content'} />
      <View
        style={{ marginHorizontal: 16, alignItems: 'center', marginTop: '10%' }}
      >
        <Text style={styles.heading1}>Select Your Insurance</Text>
        <Text style={styles.title}>
          Please Choose the type of insurance you'd like to manage today. This
          will help us customize your dashboard experience.
        </Text>

        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={() => {
            // Alert.alert(name)
            navigation.replace('Dashboard');
          }}
        >
          <View style={styles.btnView}>
            <Text style={styles.btnHeading}>General Insurance</Text>
            <Text style={styles.btnDesc}>
              Protect your assets and health with comprehensive coverage for
              everyday risks.
            </Text>
            <Text style={styles.btntext}>
              Vehicle, Health, Travel, Property Insurance
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={() => {
            // Alert.alert(name)
            navigation.replace('Dashboard');
          }}
        >
          <View style={styles.btnView}>
            <Text style={styles.btnHeading}>Life Insurance</Text>
            <Text style={styles.btnDesc}>
              Secure your family's financial future with long-term life
              protection plans.
            </Text>
            <Text style={styles.btntext}>
              Term life, whole Life, ULIP, Endowment Plans
            </Text>
          </View>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', gap: 5 }}>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'row',
            }}
          >
            <View
              style={{
                width: 10,
                height: 10,
                backgroundColor: Colors.primary,
                borderRadius: 10,
              }}
            />
            <Text style={{ fontSize: 12, color: '#212529bf' }}>
              Secure & Trusted
            </Text>
          </View>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'row',
            }}
          >
            <View
              style={{
                width: 10,
                height: 10,
                backgroundColor: Colors.primary,
                borderRadius: 10,
              }}
            />
            <Text style={{ fontSize: 12, color: '#212529bf' }}>
              Easy to manage
            </Text>
          </View>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'row',
            }}
          >
            <View
              style={{
                width: 10,
                height: 10,
                backgroundColor: Colors.primary,
                borderRadius: 10,
              }}
            />
            <Text style={{ fontSize: 12, color: '#212529bf' }}>
              Expert Support
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  heading1: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 1,
  },
  title: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    backgroundColor: Colors.white,
    padding: 10,
    borderRadius: 12,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  btnView: {
    alignItems: 'center',
  },
  btnHeading: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 8,
  },
  btnDesc: {
    // fontWeight:''
    marginBottom: 8,
    fontSize: 14,
    color: Colors.text,
    textAlign: 'center',
  },
  btntext: {
    fontSize: 12,
    color: '#212529bf',
  },
});

export default SelectInsuranceScreen;
