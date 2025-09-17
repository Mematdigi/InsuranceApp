// App.tsx
import 'react-native-gesture-handler';
import React from 'react';
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

export type RootStackParamList = {
  Login: undefined;
  Dashboard: { username: string };
  CustomerDashboard:{username: string};
  SelectInsurance: undefined;
  AddPolicy: undefined;
  ChooseCompany: undefined;
  AddPolicyStep2: { company: string };
  //AddPolicyStep3: { company: string; insuranceNumber: string };
 // AddPolicyStep4: { company: string; insuranceNumber: string };
  UploadPolicy: { company?: string; insuranceNumber?: string };
  FillManually:undefined;
  MyPolicy : undefined;
  PolicyDetails:{
    customerId:string;
    policyId:string;
    policyNumber:string;
  };
  DuePayment:undefined;
  Profile:undefined;
  FAQ:undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <AuthProvider>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginPage} options={{ title: 'Login' }} />
        <Stack.Screen name="Dashboard" component={DashboardPage} options={{ title: 'Dashboard' }} />
        <Stack.Screen name="CustomerDashboard" component={NewDashboardScreen} options={{ title: 'Customer Dashboard' }} />
        <Stack.Screen name="SelectInsurance" component={SelectInsurancePage} options={{ title: 'Select Insurance' }} />
        
        {/* Add Policy Flow Screens */}
        <Stack.Screen name="ChooseCompany" component={ChooseCompanyScreen} />
        <Stack.Screen name="AddPolicyStep2" component={InsuranceNumberScreen} />
        {/* <Stack.Screen name="AddPolicyStep3" component={InsuranceNumberWithDataScreen} /> */}
        <Stack.Screen name="UploadPolicy" component={UploadPolicyScreen} />
        <Stack.Screen name ="FillManually" component={FillManuallyScreen}/>
        <Stack.Screen name ="MyPolicy" component={MyPolicyScreen}/>
        <Stack.Screen name="PolicyDetails" component={PolicyOverviewScreen}/>
        <Stack.Screen name="DuePayment" component={DuePaymentsScreen}/>
        <Stack.Screen name="Profile" component={ProfileScreen}/>
        <Stack.Screen name="FAQ" component={FAQScreen}/>
      </Stack.Navigator>
    </NavigationContainer>
    </AuthProvider>
  );
};

export default App;
