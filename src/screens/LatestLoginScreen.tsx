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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");
const API_BASE = "http://10.0.2.2:5000/api";

const LoginScreen = () => {
  const [role, setRole] = useState<"Customer" | "Agent">("Customer");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
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

        await AsyncStorage.setItem("user", JSON.stringify(data.user));
        Alert.alert("Success", "Login successful!");
        
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

        await AsyncStorage.setItem("user", JSON.stringify(data.user));
        Alert.alert("Success", "Login successful!");
        
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
      
      {/* Top Turquoise Section */}
      <View style={styles.topSection}>
        <View style={styles.headerContent}>
          <Text style={styles.welcomeTitle}>Welcome to Name</Text>
          <Text style={styles.welcomeSubtitle}>
            Login to Your Path to a Financially{'\n'}Stress-Free Life!
          </Text>
        </View>
      </View>

      {/* Main White Container with Curve */}
      <View style={styles.mainContainer}>
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
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                      style={styles.input}
                      value={identifier}
                      onChangeText={setIdentifier}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                    />
                  </View>

                  {!isOtpLogin && (
                    <>
                      {/* Password Input */}
                      <View style={styles.inputGroup}>
                
                        <TextInput
                          style={styles.input}
                          value={password}
                          onChangeText={setPassword}
                          secureTextEntry={!showPassword}
                          autoComplete="password"
                          placeholder="Password"
                          placeholderTextColor="#00728D"
                        />
                      </View>

                      {/* Forgot Password */}
                      <TouchableOpacity style={styles.forgotPasswordContainer}>
                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {/* Login via OTP */}
                  <TouchableOpacity 
                    style={styles.otpLinkContainer}
                    onPress={() => setIsOtpLogin(!isOtpLogin)}
                  >
                    <Text style={styles.otpLinkIcon}>📱</Text>
                    <Text style={styles.otpLinkText}>Login via OTP</Text>
                  </TouchableOpacity>
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
      </View>
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
    height: height * 0.25,
    justifyContent: 'flex-start',
    paddingTop: 50,
  },
  headerContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'white',
    lineHeight: 22,
    opacity: 0.9,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    position: 'relative',
  },
  curveOverlay: {
    position: 'absolute',
    top: -50,
    left: -50,
    right: -50,
    height: 50,
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
    paddingTop: 32,
    paddingBottom: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 32,
    backgroundColor: 'transparent',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F9FF',
    marginHorizontal: 2,
  },
  leftTab: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  rightTab: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  activeTab: {
    backgroundColor: '#62D2CC',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#62D2CC',
  },
  activeTabText: {
    color: 'white',
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#00728D',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#00728D',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: 'white',
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#62D2CC',
    fontWeight: '500',
  },
  otpLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    paddingVertical: 8,
  },
  otpLinkIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  otpLinkText: {
    fontSize: 14,
    color: '#62D2CC',
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#62D2CC',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#A5D6D3',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
  },
  registerButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#F9FAFB',
  },
  registerButtonText: {
    color: '#62D2CC',
    fontSize: 16,
    fontWeight: '500',
  },
  continueWithText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    width: 48,
    height: 48,
  },
  facebookButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  facebookIcon: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  googleButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  appleButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appleIcon: {
    fontSize: 16,
  },
  // OTP Styles
  otpHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  otpTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  otpDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  identifierText: {
    fontWeight: '600',
    color: '#62D2CC',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  otpInput: {
    width: 45,
    height: 50,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    backgroundColor: 'white',
    textAlign: 'center',
  },
  otpInputFilled: {
    borderColor: '#62D2CC',
    backgroundColor: '#F0FDFA',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  timerText: {
    color: '#6B7280',
    fontSize: 14,
  },
  resendButton: {
    alignItems: 'center',
    marginBottom: 16,
  },
  resendText: {
    color: '#62D2CC',
    fontSize: 14,
    fontWeight: '500',
  },
  disabledText: {
    color: '#9CA3AF',
  },
  backButton: {
    alignItems: 'center',
    marginBottom: 16,
  },
  backButtonText: {
    color: '#6B7280',
    fontSize: 14,
  },
});

export default LoginScreen;