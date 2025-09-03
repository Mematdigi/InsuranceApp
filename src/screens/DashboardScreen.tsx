// src/screens/DashboardPage.tsx
import React, { useEffect , useState } from 'react';
import { View,
  Text,
  SafeAreaView, 
  StyleSheet,
  Button,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';

type DashboardScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;
type DashboardScreenRouteProp = RouteProp<RootStackParamList, 'Dashboard'>;

type Props = {
  navigation: DashboardScreenNavigationProp;
  route: DashboardScreenRouteProp;
};


const DashboardPage: React.FC<Props> = ({ route, navigation }) => {
  const { username } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Hello, {username}!</Text>
      <Text style={styles.subtitle}>This is your dashboard.</Text>

      <View style={{ marginTop: 30 }}>
        <Button
          title="Logout"
          color="#38C172"
          onPress={() => navigation.replace('Login')}
        />
      </View>
    </SafeAreaView>
  );
};

export default DashboardPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F9F7',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#38C172',
  },
  subtitle: {
    fontSize: 18,
    marginTop: 10,
    color: '#333',
  },
});
