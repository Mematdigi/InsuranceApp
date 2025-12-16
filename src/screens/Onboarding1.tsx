import { Image, StyleSheet, Text, View } from 'react-native';
import React, { useEffect } from 'react';
import AnimatedCirclesBG from '../components/AnimatedCirclesBG';
import { useNavigation } from '@react-navigation/native';

const Onboarding1 = () => {
  const navigation = useNavigation<any>();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Start1');
    }, 5500);

    return () => clearTimeout(timer);
  }, []);
  return (
    <View style={{ flex: 1 }}>
      <AnimatedCirclesBG />
    </View>
  );
};

export default Onboarding1;

const styles = StyleSheet.create({});
