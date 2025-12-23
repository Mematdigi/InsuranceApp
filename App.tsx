// App.tsx
import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginPage from './src/screens/LatestLoginScreen';
import DashboardPage from './src/screens/DashboardScreen';
import NewDashboardScreen from './src/screens/CustomerDashboardScreen';
import SelectInsurancePage from './src/screens/SelectInsuranceScreen';
//import AddPolicyPage from './src/screens/AddPolicyScreen';
import {
  ChooseCompanyScreen,
  InsuranceNumberScreen,
  //InsuranceNumberWithDataScreen,
  UploadPolicyScreen,
} from './src/screens/AddPolicyFlowScreens';
import FillManuallyScreen from './src/screens/FillManuallyScreen';
import MyPolicyScreen from './src/screens/MyPolicyScreen';
import PolicyOverviewScreen from './src/screens/PolicyOverviewScreen';
import DuePaymentsScreen from './src/screens/DuePaymentScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import FAQScreen from './src/screens/FAQScreen';
import { AuthProvider } from './src/context/AuthContext';
import Onboarding1 from './src/screens/Onboarding1';
import Start1 from './src/screens/Start1';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Notification from './src/screens/Notification';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AgentDrawerNavigator } from './src/navigation/DrawerNavigator';

export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  CustomerDashboard: { username: string };
  SelectInsurance: undefined;
  AddPolicy: undefined;
  ChooseCompany: undefined;
  // AddPolicyStep2: { company: string };
  AddPolicyStep2: undefined;
  //AddPolicyStep3: { company: string; insuranceNumber: string };
  // AddPolicyStep4: { company: string; insuranceNumber: string };
  UploadPolicy: { company?: string; insuranceNumber?: string };
  FillManually: undefined;
  MyPolicy: undefined;
  PolicyDetails: {
    customerId: string;
    policyId: string;
    policyNumber: string;
  };
  DuePayment: undefined;
  Profile: undefined;
  FAQ: undefined;
  Onboarding1: undefined;
  Start1: undefined;
  Notification: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  const [initialRoute, setInitialRoute] = useState<
    'Onboarding1' | 'Login' | 'CustomerDashboard' | null
  >(null);

  // useEffect(() => {
  //   const checkFirstLaunch = async () => {
  //     const alreadyLaunched = await AsyncStorage.getItem('alreadyLaunched');
  //     if (alreadyLaunched) {
  //       setIsFirstLaunch(false);
  //     } else {
  //       setIsFirstLaunch(true);
  //       await AsyncStorage.setItem('alreadyLaunched', 'true');
  //     }
  //   };

  //   checkFirstLaunch();
  // }, []);

  useEffect(() => {
    const checkAppFlow = async () => {
      const alreadyLaunched = await AsyncStorage.getItem('alreadyLaunched');
      const username = await AsyncStorage.getItem('user'); // 👈 username key

      console.log(username);

      if (!alreadyLaunched) {
        // First time launch
        await AsyncStorage.setItem('alreadyLaunched', 'true');
        setIsFirstLaunch(true);
        setInitialRoute('Onboarding1');
      } else {
        // Not first launch
        setIsFirstLaunch(false);

        if (username) {
          setInitialRoute('CustomerDashboard');
        } else {
          setInitialRoute('Login');
        }
      }
    };

    checkAppFlow();
  }, []);

  if (isFirstLaunch === null) {
    return null; // Optionally, show a loading screen while checking the AsyncStorage
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator
            // initialRouteName={initialRoute as any}
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen name="Onboarding1" component={Onboarding1} />
            <Stack.Screen name="Start1" component={Start1} />
            <Stack.Screen name="Notification" component={Notification} />
            <Stack.Screen
              name="Login"
              component={LoginPage}
              options={{ title: 'Login' }}
            />
            <Stack.Screen
              name="Dashboard"
              component={AgentDrawerNavigator}
              options={{ title: 'Dashboard' }}
            />
            <Stack.Screen
              name="CustomerDashboard"
              component={NewDashboardScreen}
              options={{ title: 'Customer Dashboard' }}
            />
            <Stack.Screen
              name="SelectInsurance"
              component={SelectInsurancePage}
              options={{ title: 'Select Insurance' }}
            />

            {/* Add Policy Flow Screens */}
            <Stack.Screen
              name="ChooseCompany"
              component={ChooseCompanyScreen}
            />
            <Stack.Screen
              name="AddPolicyStep2"
              component={InsuranceNumberScreen}
            />
            {/* <Stack.Screen name="AddPolicyStep3" component={InsuranceNumberWithDataScreen} /> */}
            <Stack.Screen name="UploadPolicy" component={UploadPolicyScreen} />
            <Stack.Screen name="FillManually" component={FillManuallyScreen} />
            <Stack.Screen name="MyPolicy" component={MyPolicyScreen} />
            <Stack.Screen
              name="PolicyDetails"
              component={PolicyOverviewScreen}
            />
            <Stack.Screen name="DuePayment" component={DuePaymentsScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="FAQ" component={FAQScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </GestureHandlerRootView>
  );
};

export default App;
