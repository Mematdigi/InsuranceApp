// src/screens/SelectInsuranceScreen.tsx
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const SelectInsuranceScreen = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Insurance</Text>
      {/* You can add logic to select the insurance here */}
      <Button title="Go to Dashboard" onPress={() => navigation.navigate('Dashboard', { username: 'User' })} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F9F7',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#38C172',
    marginBottom: 20,
  },
});

export default SelectInsuranceScreen;
