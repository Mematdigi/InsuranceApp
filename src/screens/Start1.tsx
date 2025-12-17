import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';

const AnimatedTextItem = ({
  item,
  isOld,
}: {
  item: string[];
  isOld: boolean;
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      // opacity: withTiming(isOld ? 0 : 1, { duration: 300 }),
      transform: [
        {
          translateY: withTiming(isOld ? -10 : 0, { duration: 300 }),
        },
      ],
    };
  }, [isOld]);

  return (
    <Animated.View
      entering={FadeInUp.duration(300)}
      style={[styles.textWrapper, animatedStyle]}
    >
      <Text style={styles.text1}>{item[0]}</Text>
      <Text style={styles.text2}>{item[1]}</Text>
      <Text style={styles.text3}>{item[2]}</Text>
    </Animated.View>
  );
};

const Start1 = () => {
  const [visibleSteps, setVisibleSteps] = useState(1);

  const nav = useNavigation<any>();

  const texts = [
    [
      'Trusted Protection',
      'Always.',
      'Secure your life, health, and home with confidence.',
    ],
    [
      'Care Without',
      'Complexity.',
      'Easy plans, clear benefits, complete peace of mind.',
    ],
    [
      'Insurance Made',
      'Simple.',
      'Transparent, reliable, and designed for you peace of mind.',
    ],
  ];

  const onNext = () => {
    if (visibleSteps < texts.length) {
      setVisibleSteps(prev => prev + 1);
    }
  };

  const navigateToLogin = () => {
    nav.replace('Login');
  };

  return (
    <View style={styles.container}>
      {texts.slice(0, visibleSteps).map((item, index) => (
        <AnimatedTextItem
          key={index}
          item={item}
          isOld={index < visibleSteps - 1}
        />
      ))}

      {visibleSteps === texts.length ? (
        <TouchableOpacity
          style={[styles.btn]}
          onPress={navigateToLogin}
          // activeOpacity={0.8}
          // disabled={visibleSteps === texts.length}
        >
          <Text style={styles.btnText}>Get Started</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[
            styles.btn,
            visibleSteps === texts.length && styles.btnDisabled,
          ]}
          onPress={onNext}
          // activeOpacity={0.8}
          // disabled={visibleSteps === texts.length}
        >
          <Text style={styles.btnText}>Next</Text>
          {/* <Ionicons name="arrow-back-outline" size={20} color={'#6FD0CD'} /> */}
        </TouchableOpacity>
      )}
    </View>
  );
};

export default Start1;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#fff',
  },
  textWrapper: { marginVertical: 6 },
  text3: { fontSize: 16, fontWeight: '300', color: '#000000' },
  btn: {
    marginTop: 28,
    alignSelf: 'flex-start',
    backgroundColor: '#1F9393',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    position: 'absolute',
    bottom: '10%',
    left: 24,
  },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  text1: {
    fontSize: 26,
    fontWeight: '600',
    color: '#000000',
  },
  text2: {
    fontSize: 26,
    fontWeight: '600',
    color: '#6FD0CD',
  },
});
