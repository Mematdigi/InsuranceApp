import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  StatusBar,
  Animated,
  Easing,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get("window");
const API_BASE = "https://policysaath.com/api/api";

const LoginScreen = () => {
  const [role, setRole] = useState<"Customer" | "Agent">("Customer");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isOtpLogin, setIsOtpLogin] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [timer, setTimer] = useState(120);
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  
  // Register form state
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerMobile, setRegisterMobile] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const otpRefs = useRef<Array<TextInput | null>>([]);
  const navigation = useNavigation<any>();
  const { setCustomerId } = useAuth();

  // Animation values
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(-60)).current;
  const titleScale = useRef(new Animated.Value(0.5)).current;
  const titleRotateX = useRef(new Animated.Value(90)).current;
  
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleTranslateY = useRef(new Animated.Value(40)).current;
  const subtitleScale = useRef(new Animated.Value(0.8)).current;
  
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(30)).current;
  
  // Background animation values
  const circle1Opacity = useRef(new Animated.Value(0.7)).current;
  const circle1Scale = useRef(new Animated.Value(1)).current;
  const circle1Rotate = useRef(new Animated.Value(0)).current;
  
  const circle2Opacity = useRef(new Animated.Value(0.7)).current;
  const circle2Scale = useRef(new Animated.Value(1)).current;
  const circle2Rotate = useRef(new Animated.Value(0)).current;
  
  const circle3Opacity = useRef(new Animated.Value(0.7)).current;
  const circle3Scale = useRef(new Animated.Value(1)).current;
  const circle3Rotate = useRef(new Animated.Value(0)).current;

  // ADD these new refs after existing animation values:
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerHeight = useRef(new Animated.Value(height * 0.4)).current;
  const headerOpacity = useRef(new Animated.Value(1)).current;
  const headerScale = useRef(new Animated.Value(1)).current;
  // Start animations on mount
  useEffect(() => {
    // Title entrance animation
    Animated.sequence([
      Animated.delay(500),
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 2000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();

    Animated.sequence([
      Animated.delay(500),
      Animated.timing(titleTranslateY, {
        toValue: 0,
        duration: 2000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();

    Animated.sequence([
      Animated.delay(500),
      Animated.timing(titleScale, {
        toValue: 1,
        duration: 2000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();

    Animated.sequence([
      Animated.delay(500),
      Animated.timing(titleRotateX, {
        toValue: 0,
        duration: 2000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();

    // Subtitle entrance animation
    Animated.sequence([
      Animated.delay(1500),
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 2000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();

    Animated.sequence([
      Animated.delay(1500),
      Animated.timing(subtitleTranslateY, {
        toValue: 0,
        duration: 2000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();

    Animated.sequence([
      Animated.delay(1500),
      Animated.timing(subtitleScale, {
        toValue: 1,
        duration: 2000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();

    // Form entrance animation
    Animated.sequence([
      Animated.delay(2500),
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 1500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();

    Animated.sequence([
      Animated.delay(2500),
      Animated.timing(formTranslateY, {
        toValue: 0,
        duration: 1500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();

    // Background circles animation
    const startBackgroundAnimations = () => {
      // Circle 1 animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(circle1Scale, {
            toValue: 1.2,
            duration: 3000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false,
          }),
          Animated.timing(circle1Scale, {
            toValue: 0.8,
            duration: 3000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.timing(circle1Rotate, {
          toValue: 360,
          duration: 8000,
          easing: Easing.linear,
          useNativeDriver: false,
        })
      ).start();

      // Circle 2 animation (delayed)
      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(circle2Scale, {
              toValue: 1.3,
              duration: 4000,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: false,
            }),
            Animated.timing(circle2Scale, {
              toValue: 0.7,
              duration: 4000,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: false,
            }),
          ])
        ).start();

        Animated.loop(
          Animated.timing(circle2Rotate, {
            toValue: 360,
            duration: 12000,
            easing: Easing.linear,
            useNativeDriver: false,
          })
        ).start();
      }, 2000);

      // Circle 3 animation (more delayed)
      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(circle3Scale, {
              toValue: 1.1,
              duration: 5000,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: false,
            }),
            Animated.timing(circle3Scale, {
              toValue: 0.9,
              duration: 5000,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: false,
            }),
          ])
        ).start();

        Animated.loop(
          Animated.timing(circle3Rotate, {
            toValue: 360,
            duration: 10000,
            easing: Easing.linear,
            useNativeDriver: false,
          })
        ).start();
      }, 4000);
    };

    startBackgroundAnimations();
  }, []);

  // ADD this function after existing useEffect:
const handleScroll = Animated.event(
  [{ nativeEvent: { contentOffset: { y: scrollY } } }],
  { 
    useNativeDriver: false,
    listener: (event: any) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      const threshold = 50;
      const maxCollapse = 150;
      
      const progress = Math.min(Math.max(offsetY - threshold, 0) / maxCollapse, 1);
      
      const minHeight = height * 0.1;
      const maxHeight = height * 0.4;
      const newHeight = maxHeight - (maxHeight - minHeight) * progress;
      
      headerHeight.setValue(newHeight);
      headerOpacity.setValue(1 - progress * 0.8);
      headerScale.setValue(1 - progress * 0.3);
    }
  }
);

const resetHeader = () => {
  Animated.parallel([
    Animated.timing(headerHeight, { toValue: height * 0.4, duration: 300, useNativeDriver: false }),
    Animated.timing(headerOpacity, { toValue: 1, duration: 300, useNativeDriver: false }),
    Animated.timing(headerScale, { toValue: 1, duration: 300, useNativeDriver: false }),
  ]).start();
};

  // OTP Countdown
  useEffect(() => {
    let countdown: NodeJS.Timeout;
    if (otpSent && timer > 0) {
      countdown = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(countdown);
  }, [otpSent, timer]);

  const handleOtpChange = (value: string, index: number) => {
    if (/^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) otpRefs.current[index + 1]?.focus();
      if (!value && index > 0) otpRefs.current[index - 1]?.focus();
    }
  };

  const handleLogin = async () => {
    if (!identifier || (!isOtpLogin && !password)) {
      return Alert.alert("Error", "Please fill all fields");
    }

    try {
      setLoading(true);

      if (isOtpLogin && !otpSent) {
        const res = await fetch(`${API_BASE}/otp-login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contactNumber: identifier, role }),
        });
        const data = await res.json();
        if (!res.ok) {
          if (data.msg?.includes('not found') || data.msg?.includes('does not exist')) {
            Alert.alert(
              "Account Not Found", 
              "This email/phone is not registered. Would you like to create an account?",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Register", onPress: () => setShowRegister(true) }
              ]
            );
            return;
          }
          throw new Error(data.msg || "Failed to send OTP");
        }

        setOtpSent(true);
        setTimer(120);
        Alert.alert("Success", "OTP sent successfully!");
      } else if (isOtpLogin && otpSent) {
        const enteredOtp = otp.join("");
        if (enteredOtp.length < 6) {
          return Alert.alert("Error", "Enter valid OTP");
        }
        const res = await fetch(`${API_BASE}/otp-login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contactNumber: identifier, role, otp: enteredOtp }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.msg || "OTP verification failed");

        // ✅ Normalize user object so it always has an `id` field
        const normalizedUser = {
          ...data.user,
          id: data.user.id || data.user._id,
        };

        await AsyncStorage.setItem("user", JSON.stringify(normalizedUser));
        Alert.alert("Success", "Login successful!");
        setCustomerId(normalizedUser.id);

        
        if (role === "Agent") {
          navigation.replace("SelectInsurance");
        } else {
          navigation.replace("CustomerDashboard", { username: data.user.username });
        }
      } else {
        const res = await fetch(`${API_BASE}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier, password, role }),
        });
        const data = await res.json();
        if (!res.ok) {
          if (data.msg?.includes('not found') || data.msg?.includes('does not exist')) {
            Alert.alert(
              "Account Not Found", 
              "This email is not registered. Would you like to create an account?",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Register", onPress: () => setShowRegister(true) }
              ]
            );
            return;
          }
          throw new Error(data.msg || "Login failed");
        }

        // ✅ Normalize user object so it always has an `id` field
        const normalizedUser = {
          ...data.user,
          id: data.user.id || data.user._id,
        };

        await AsyncStorage.setItem("user", JSON.stringify(normalizedUser));
        Alert.alert("Success", "Login successful!");
        setCustomerId(normalizedUser.id); 

        if (role === "Agent") {
          navigation.replace("SelectInsurance");
        } else {
          navigation.replace("CustomerDashboard", { username: data.user.username });
        }
      }
    } catch (err: any) {
      console.log(err);
      Alert.alert("Error", err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!registerName || !registerEmail || !registerMobile || !registerPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    if (registerPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: registerName,
          email: registerEmail,
          mobile: registerMobile,
          password: registerPassword,
          role: role.toLowerCase()
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        Alert.alert("Success", "Account created successfully! Please login.");
        setShowRegister(false);
        setIdentifier(registerEmail);
        setRegisterName("");
        setRegisterEmail("");
        setRegisterMobile("");
        setRegisterPassword("");
        setConfirmPassword("");
      } else {
        Alert.alert("Error", data.message || "Registration failed");
      }
    } catch (err: any) {
      console.log(err);
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const res = await fetch(`${API_BASE}/otp-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactNumber: identifier, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to resend OTP");
      setOtpSent(true);
      setTimer(120);
      Alert.alert("Success", "OTP resent successfully!");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Something went wrong");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#62D2CC" barStyle="light-content" />
      
      {/* Top Turquoise Section with Enhanced Header */}
      <View style={styles.topSection}>
        {/* Animated Background Circles */}
        <Animated.View style={[
          styles.bgCircle1,
          {
            opacity: circle1Opacity,
            transform: [
              { scale: circle1Scale },
              { rotate: circle1Rotate.interpolate({
                inputRange: [0, 360],
                outputRange: ['0deg', '360deg']
              })}
            ]
          }
        ]} />
        
        <Animated.View style={[
          styles.bgCircle2,
          {
            opacity: circle2Opacity,
            transform: [
              { scale: circle2Scale },
              { rotate: circle2Rotate.interpolate({
                inputRange: [0, 360],
                outputRange: ['0deg', '360deg']
              })}
            ]
          }
        ]} />
        
        <Animated.View style={[
          styles.bgCircle3,
          {
            opacity: circle3Opacity,
            transform: [
              { scale: circle3Scale },
              { rotate: circle3Rotate.interpolate({
                inputRange: [0, 360],
                outputRange: ['0deg', '360deg']
              })}
            ]
          }
        ]} />
        

        <View style={styles.headerContent}>
          <Animated.Text style={[
            styles.welcomeTitle,
            {
              opacity: titleOpacity,
              transform: [
                { translateY: titleTranslateY },
                { scale: titleScale },
                { perspective: 1000 },
                { rotateX: titleRotateX.interpolate({
                  inputRange: [0, 90],
                  outputRange: ['0deg', '90deg']
                })}
              ]
            }
          ]}>
            Welcome to PolicySaath
          </Animated.Text>
          
          <Animated.Text style={[
            styles.welcomeSubtitle,
            {
              opacity: subtitleOpacity,
              transform: [
                { translateY: subtitleTranslateY },
                { scale: subtitleScale }
              ]
            }
          ]}>
            Login to Your Path to a Hassle-Free{'\n'}Experience!
          </Animated.Text>
        </View>
      </View>

      {/* Main White Container with Enhanced Form */}
      <Animated.View style={[
        styles.mainContainer,
        {
          opacity: formOpacity,
          transform: [{ translateY: formTranslateY }]
        }
      ]}>
        {/* Curved overlay to create the curve effect */}
        <View style={styles.curveOverlay} />
        
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
         
        >
          {/* Tab Selection */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab, 
                styles.leftTab,
                role === "Customer" && styles.activeTab
              ]}
              onPress={() => setRole("Customer")}
            >
              <Text style={[
                styles.tabText, 
                role === "Customer" && styles.activeTabText
              ]}>
                Customer Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab, 
                styles.rightTab,
                role === "Agent" && styles.activeTab
              ]}
              onPress={() => setRole("Agent")}
            >
              <Text style={[
                styles.tabText, 
                role === "Agent" && styles.activeTabText
              ]}>
                Agent Login
              </Text>
            </TouchableOpacity>
          </View>

          {!showRegister ? (
            <>
              {!otpSent ? (
                <>
                  {/* Email Input */}
                  <View style={styles.inputGroup}>
                    {/* <Text style={styles.label}>Email</Text> */}
                    <TextInput
                      style={[
                        styles.input,
                        emailFocused && styles.inputFocused]}
                      value={identifier}
                      onChangeText={setIdentifier}
                      onFocus={()=>setEmailFocused(true)}
                      onBlur={()=>setEmailFocused(false)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                    />
                    <Text style={[
                      styles.label,
                      (emailFocused || identifier) && styles.labelFocused  // ✅ ADD dynamic styling
                    ]}>
                      Email
                    </Text>
                  </View>

                  {!isOtpLogin && (
                    <>
                      {/* Password Input */}
                      <View style={styles.inputGroup}>
                        {/* <Text style={styles.label}>Password</Text> */}
                        <TextInput
                          style={[
                            styles.input,
                          passwordFocused && styles.inputFocused
                        ]}
                          value={password}
                          onChangeText={setPassword}
                          onFocus={() => setPasswordFocused(true)}   // ✅ ADD focus handlers
                          onBlur={() => setPasswordFocused(false)} 
                          secureTextEntry={!showPassword}
                          autoComplete="password"
                          // placeholder="Password"
                          placeholderTextColor="#00728D"
                        />
                        <Text style={[
                          styles.label,
                          (passwordFocused || password) && styles.labelFocused  // ✅ ADD dynamic styling
                        ]}>
                          Password
                        </Text>
                      </View>

                      {/* Forgot Password */}
                      <TouchableOpacity style={styles.forgotPasswordContainer}>
                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {/* Login via OTP - moved after login button */}
                </>
              ) : (
                // OTP Section
                <>
                  <View style={styles.otpHeader}>
                    <Text style={styles.otpTitle}>Verify OTP</Text>
                    <Text style={styles.otpDescription}>
                      Enter the 6-digit code sent to{'\n'}
                      <Text style={styles.identifierText}>
                        {identifier.includes("@") ? "📧 " + identifier : "📱 " + identifier}
                      </Text>
                    </Text>
                  </View>

                  <View style={styles.otpContainer}>
                    {otp.map((digit, idx) => (
                      <TextInput
                        key={idx}
                        style={[
                          styles.otpInput,
                          digit && styles.otpInputFilled
                        ]}
                        maxLength={1}
                        keyboardType="number-pad"
                        ref={(el) => { otpRefs.current[idx] = el; }}
                        value={digit}
                        onChangeText={(val) => handleOtpChange(val, idx)}
                        textAlign="center"
                      />
                    ))}
                  </View>

                  <View style={styles.timerContainer}>
                    <Text style={styles.timerText}>
                      ⏱️ Code expires in {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}
                    </Text>
                  </View>

                  <TouchableOpacity 
                    onPress={handleResendOtp}
                    style={styles.resendButton}
                    disabled={timer > 0}
                  >
                    <Text style={[styles.resendText, timer > 0 && styles.disabledText]}>
                      🔄 Resend OTP
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={() => {
                      setOtpSent(false);
                      setOtp(Array(6).fill(""));
                      setTimer(120);
                    }}
                    style={styles.backButton}
                  >
                    <Text style={styles.backButtonText}>← Change Email/Phone</Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Login Button */}
              <TouchableOpacity 
                style={[styles.loginButton, loading && styles.disabledButton]} 
                onPress={handleLogin} 
                disabled={loading}
              >
                <Text style={styles.loginButtonText}>
                  {loading ? 
                    (otpSent ? "Verifying..." : (isOtpLogin ? "Sending OTP..." : "Logging in...")) : 
                    (otpSent ? "Verify & Continue" : (isOtpLogin ? "Send OTP" : "Login"))
                  }
                </Text>
              </TouchableOpacity>

              {/* Login via OTP Link - moved below login button */}
              {!otpSent && (
                <TouchableOpacity 
                  style={styles.otpLinkSimple}
                  onPress={() => setIsOtpLogin(!isOtpLogin)}
                >
                  <Text style={styles.otpLinkSimpleText}>
                    {isOtpLogin ? "← Back to Password Login" : "Login via OTP →"}
                  </Text>
                </TouchableOpacity>
              )}

              {!otpSent && (
                <>
                  {/* Or Divider */}
                  <View style={styles.orContainer}>
                    <View style={styles.orLine} />
                    <Text style={styles.orText}>Or</Text>
                    <View style={styles.orLine} />
                  </View>

                  {/* Register Button */}
                  <TouchableOpacity
                    style={styles.registerButton}
                    onPress={() => setShowRegister(true)}
                  >
                    <Text style={styles.registerButtonText}>Register</Text>
                  </TouchableOpacity>

                  {/* Continue with text */}
                  <Text style={styles.continueWithText}>or continue with</Text>

                  {/* Social Buttons */}
                  <View style={styles.socialButtonsContainer}>
                    <TouchableOpacity style={styles.socialButton}>
                      <View style={styles.facebookButton}>
                        <Text style={styles.facebookIcon}>f</Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.socialButton}>
                      <View style={styles.googleButton}>
                        <Text style={styles.googleIcon}>G</Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.socialButton}>
                      <View style={styles.appleButton}>
                        <Text style={styles.appleIcon}>🍎</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </>
          ) : (
            // Register Form
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  value={registerName}
                  onChangeText={setRegisterName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={registerEmail}
                  onChangeText={setRegisterEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mobile Number</Text>
                <TextInput
                  style={styles.input}
                  value={registerMobile}
                  onChangeText={setRegisterMobile}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  value={registerPassword}
                  onChangeText={setRegisterPassword}
                  secureTextEntry={true}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={true}
                />
              </View>

              <TouchableOpacity
                style={[styles.loginButton, loading && styles.disabledButton]}
                onPress={handleRegister}
                disabled={loading}
              >
                <Text style={styles.loginButtonText}>
                  {loading ? "Creating Account..." : "Register"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setShowRegister(false)}
              >
                <Text style={styles.backButtonText}>← Back to Login</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#62D2CC',
  },
  topSection: {
    backgroundColor: '#62D2CC',
    height: height * 0.3,
    justifyContent: 'center',
    paddingTop: 30,
    paddingBottom: 30,
    position: 'relative',
    overflow: 'hidden',
  },
  // Animated background circles
  bgCircle1: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    top: '15%',
    left: '8%',
  },
  bgCircle2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: '65%',
    right: '10%',
  },
  bgCircle3: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    bottom: '25%',
    left: '15%',
  },
  headerContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
    zIndex: 10,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 24,
    textAlign: 'center',
    fontWeight: '400',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    minHeight: height * 0.6,
  },
  curveOverlay: {
    position: 'absolute',
    top: -40,
    left: -50,
    right: -50,
    height: 40,
    backgroundColor: '#62D2CC',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 150,
    transform: [{ scaleX: 1.5 }],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
    minHeight:height*0.8,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 32,
    backgroundColor: 'transparent',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FFFE',
    marginHorizontal: 1,
  },
  leftTab: {
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  rightTab: {
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  activeTab: {
    backgroundColor: '#62D2CC',
    shadowColor: '#62D2CC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#62D2CC',
  },
  activeTabText: {
    color: 'white',
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    position:'absolute',
    left:16,
    top:-12,
    zIndex:1,
    fontSize: 14,
    fontWeight: '500',
    color: '#00728D',
    paddingHorizontal:8,
    backgroundColor:'white',
    paddingVertical:2,
  },

  labelFocused:{
    color: '#62D2CC',
  },
  inputFocused: {
  borderColor: '#62D2CC',
  shadowColor: '#62D2CC',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
},

  input: {
    borderWidth: 2,
    borderColor: '#9BD5D1',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingLeft:20,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFf',
    fontWeight: '500',
    
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#62D2CC',
    fontWeight: '600',
  },
  // New simplified OTP link styles
  otpLinkSimple: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 8,
  },
  otpLinkSimpleText: {
    fontSize: 14,
    color: '#62D2CC',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  loginButton: {
    backgroundColor: '#62D2CC',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#62D2CC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  disabledButton: {
    backgroundColor: '#A5D6D3',
    shadowOpacity: 0.1,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  orText: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  registerButton: {
    borderWidth: 2,
    borderColor: '#62D2CC',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 28,
    backgroundColor: 'transparent',
  },
  registerButtonText: {
    color: '#62D2CC',
    fontSize: 18,
    fontWeight: '600',
  },
  continueWithText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 20,
    fontWeight: '500',
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  socialButton: {
    width: 56,
    height: 56,
  },
  facebookButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  facebookIcon: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  googleButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  googleIcon: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  appleButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1F2937',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  appleIcon: {
    fontSize: 18,
  },
  // OTP Styles
  otpHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  otpTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  otpDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  identifierText: {
    fontWeight: '700',
    color: '#62D2CC',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  otpInput: {
    width: 50,
    height: 56,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    backgroundColor: 'white',
    textAlign: 'center',
  },
  otpInputFilled: {
    borderColor: '#62D2CC',
    backgroundColor: '#F0FDFA',
    shadowColor: '#62D2CC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timerText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  resendButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resendText: {
    color: '#62D2CC',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledText: {
    color: '#9CA3AF',
  },
  backButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default LoginScreen;