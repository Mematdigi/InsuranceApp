import { createDrawerNavigator } from '@react-navigation/drawer';
import DashboardPage from '../screens/DashboardScreen';
import AgentImportPolicy from '../screens/AgentImportPolicy';
import Colors from '../constant/Colors';
import AgentAddNewPolicy from '../screens/AgentAddNewPolicy';

export type agentDrawerParamList = {
  Dashboard: undefined;
  ImportPolicy: undefined;
  AddNewPolicy:undefined;
};

const AgentDrawer = createDrawerNavigator<agentDrawerParamList>();

export const AgentDrawerNavigator = () => {
  return (
    <AgentDrawer.Navigator screenOptions={{
        headerStyle:{
            backgroundColor:Colors.primary
        }
    }}>
      <AgentDrawer.Screen name="Dashboard" component={DashboardPage} />
      <AgentDrawer.Screen name="ImportPolicy" component={AgentImportPolicy} />
      <AgentDrawer.Screen name="AddNewPolicy" component={AgentAddNewPolicy} />
    </AgentDrawer.Navigator>
  );
};
