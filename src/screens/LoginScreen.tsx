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
const API_BASE = "http://10.0.2.2:5000/api"; // replace with your PC local IP

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
        // Send OTP
        const res = await fetch(`${API_BASE}/otp-login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contactNumber: identifier, role }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.msg || "Failed to send OTP");

        setOtpSent(true);
        setTimer(120);
        Alert.alert("Success", "OTP sent successfully!");
      } else if (isOtpLogin && otpSent) {
        // Verify OTP
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
        //navigation.navigate(role === "Agent" ? "SelectInsurance" : "CustomerDashboard");
      } else {
        // Password Login
        const res = await fetch(`${API_BASE}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier, password, role }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.msg || "Login failed");

        await AsyncStorage.setItem("user", JSON.stringify(data.user));
        Alert.alert("Success", "Login successful!");
        navigation.navigate(role === "Agent" ? "SelectInsurance" : "CustomerDashboard");
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
      <StatusBar barStyle="light-content" backgroundColor="#4ECDC4" />
      
      {/* Header with Gradient */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            {role === "Customer" ? "Access your insurance policies" : "Manage customer policies"}
          </Text>
        </View>
        
        {/* Decorative circles */}
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />
      </View>

      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        {/* Role Selection Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Select Your Role</Text>
          <View style={styles.roleToggle}>
            <TouchableOpacity
              style={[styles.roleButton, role === "Customer" && styles.activeRole]}
              onPress={() => setRole("Customer")}
            >
              <Text style={[styles.roleText, role === "Customer" && styles.activeRoleText]}>
                👤 Customer
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleButton, role === "Agent" && styles.activeRole]}
              onPress={() => setRole("Agent")}
            >
              <Text style={[styles.roleText, role === "Agent" && styles.activeRoleText]}>
                🏢 Agent
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Login Form Card */}
        <View style={styles.card}>
          {!otpSent ? (
            <>
              <Text style={styles.cardTitle}>
                {isOtpLogin ? "Login with OTP" : "Login to Continue"}
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email / Phone Number</Text>
                <TextInput
                  placeholder="Enter your email or phone"
                  style={styles.input}
                  value={identifier}
                  onChangeText={setIdentifier}
                  keyboardType="email-address"
                  placeholderTextColor="#9CD1CE"
                />
              </View>

              {!isOtpLogin && (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      placeholder="Enter your password"
                      style={styles.passwordInput}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      placeholderTextColor="#9CD1CE"
                    />
                    <TouchableOpacity 
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeButton}
                    >
                      <Text style={styles.eyeText}>{showPassword ? "👁️" : "👁️‍🗨️"}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <TouchableOpacity 
                onPress={() => setIsOtpLogin(!isOtpLogin)}
                style={styles.switchButton}
              >
                <Text style={styles.switchText}>
                  {isOtpLogin ? "← Back to Password Login" : "📱 Login via OTP instead"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.loginButton, loading && styles.disabledButton]} 
                onPress={handleLogin} 
                disabled={loading}
              >
                <Text style={styles.loginButtonText}>
                  {loading ? "Processing..." : (isOtpLogin ? "Send OTP" : "Login")}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.cardTitle}>Verify OTP</Text>
              <Text style={styles.otpDescription}>
                Enter the 6-digit code sent to{"\n"}
                <Text style={styles.identifierText}>
                  {identifier.includes("@") ? "📧 " + identifier : "📱 " + identifier}
                </Text>
              </Text>

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
                style={[styles.loginButton, loading && styles.disabledButton]} 
                onPress={handleLogin} 
                disabled={loading}
              >
                <Text style={styles.loginButtonText}>
                  {loading ? "Verifying..." : "Verify & Continue"}
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
                <Text style={styles.backButtonText}>← Change Phone/Email</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F9F8",
  },
  header: {
    backgroundColor: "#4ECDC4",
    height: height * 0.35,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  headerContent: {
    alignItems: "center",
    zIndex: 10,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#D7EAEE",
    textAlign: "center",
    paddingHorizontal: 40,
  },
  circle: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 1000,
  },
  circle1: {
    width: 200,
    height: 200,
    top: -100,
    right: -50,
  },
  circle2: {
    width: 150,
    height: 150,
    bottom: -75,
    left: -30,
  },
  circle3: {
    width: 100,
    height: 100,
    top: 50,
    left: -20,
  },
  formContainer: {
    flex: 1,
    marginTop: -30,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#4ECDC4",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4ECDC4",
    marginBottom: 20,
    textAlign: "center",
  },
  roleToggle: {
    flexDirection: "row",
    backgroundColor: "#F0F9F8",
    borderRadius: 12,
    padding: 4,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  activeRole: {
    backgroundColor: "#4ECDC4",
    shadowColor: "#4ECDC4",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  roleText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#61BACA",
  },
  activeRoleText: {
    color: "white",
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4ECDC4",
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: "#D7EAEE",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#FAFFFE",
    color: "#4ECDC4",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#D7EAEE",
    borderRadius: 12,
    backgroundColor: "#FAFFFE",
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: "#4ECDC4",
  },
  eyeButton: {
    padding: 16,
  },
  eyeText: {
    fontSize: 20,
  },
  switchButton: {
    alignItems: "center",
    marginBottom: 24,
  },
  switchText: {
    color: "#61BACA",
    fontSize: 16,
    fontWeight: "500",
  },
  loginButton: {
    backgroundColor: "#4ECDC4",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#4ECDC4",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: "#9CD1CE",
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  otpDescription: {
    textAlign: "center",
    color: "#61BACA",
    fontSize: 16,
    marginBottom: 30,
    lineHeight: 24,
  },
  identifierText: {
    fontWeight: "bold",
    color: "#4ECDC4",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  otpInput: {
    width: 50,
    height: 60,
    borderWidth: 2,
    borderColor: "#D7EAEE",
    borderRadius: 12,
    fontSize: 24,
    fontWeight: "bold",
    color: "#4ECDC4",
    backgroundColor: "#FAFFFE",
  },
  otpInputFilled: {
    borderColor: "#4ECDC4",
    backgroundColor: "#F0F9F8",
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  timerText: {
    color: "#61BACA",
    fontSize: 14,
    fontWeight: "500",
  },
  resendButton: {
    alignItems: "center",
    marginBottom: 24,
  },
  resendText: {
    color: "#4ECDC4",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledText: {
    color: "#9CD1CE",
  },
  backButton: {
    alignItems: "center",
    marginTop: 16,
  },
  backButtonText: {
    color: "#61BACA",
    fontSize: 16,
    fontWeight: "500",
  },
  bottomSpacing: {
    height: 40,
  },
});

export default LoginScreen;
