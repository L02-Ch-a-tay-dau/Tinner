import { ActivityIndicator, Image, Pressable, StyleSheet, Text, TextInput, View, Alert } from "react-native";
import { colors, shadow, sharedStyles, spacing } from "../theme";
// 1. Import Sentry
import * as Sentry from '@sentry/react-native';
interface LoginScreenProps {
  email: string;
  password: string;
  error: string;
  loading: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onLogin: () => void;
  onGoToSignup: () => void;
}

export function LoginScreen({
  email,
  password,
  error,
  loading,
  onEmailChange,
  onPasswordChange,
  onLogin,
  onGoToSignup,
}: LoginScreenProps) {

  // 2. Hàm gây lỗi thử nghiệm
  const handleTestSentry = () => {
    // Cách 1: Gửi một tin nhắn thông báo (không gây crash)
    Sentry.captureMessage("User clicked Test Sentry button");

    // Cách 2: Gây lỗi crash thực sự sau 500ms để bạn kịp thấy thông báo
    Alert.alert("Sentry Test", "Ứng dụng sẽ gây lỗi và gửi báo cáo sau 1 giây.");
    
    setTimeout(() => {
      throw new Error("Tinner App Test Error: " + new Date().toISOString());
    }, 1000);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <View style={styles.logoWrap}>
          <Image source={require("../../assets/tinner_logo.png")} style={styles.logo} />
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Log in to continue swiping</Text>
        </View>
        {/* Nút Test Sentry (Đã ẩn đi)
        <Pressable 
          style={[styles.debugButton, { borderColor: colors.orange, marginTop: 10 }]} 
          onPress={handleTestSentry}
        >
          <Text style={[styles.debugText, { color: colors.orange }]}>🛠 Debug: Trigger Sentry Error</Text>
        </Pressable>
        */}

        {!!error && <Text style={sharedStyles.error}>{error}</Text>}

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrap}>
            <Text style={styles.inputIcon}>✉</Text>
            <TextInput
              value={email}
              onChangeText={onEmailChange}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrap}>
            <Text style={styles.inputIcon}>⌕</Text>
            <TextInput
              value={password}
              onChangeText={onPasswordChange}
              placeholder="••••••••"
              secureTextEntry
              style={styles.input}
            />
          </View>
        </View>

        <Pressable style={styles.loginButton} onPress={onLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.loginText}>Log In</Text>
          )}
        </Pressable>

        <Pressable onPress={onGoToSignup} hitSlop={8}>
          <Text style={styles.signupText}>
            Don't have an account? <Text style={styles.signupLink}>Sign Up</Text>
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  card: {
    gap: 16,
  },
  logoWrap: {
    alignItems: "center",
    marginBottom: 14,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: "contain",
    marginBottom: 16,
  },
  logoText: {
    color: colors.white,
    fontSize: 32,
    fontWeight: "900",
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.faint,
    fontSize: 14,
    marginTop: 5,
  },
  field: {
    gap: 8,
  },
  label: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "600",
  },
  inputWrap: {
    position: "relative",
    justifyContent: "center",
  },
  inputIcon: {
    position: "absolute",
    left: 14,
    zIndex: 1,
    color: colors.faint,
    fontSize: 17,
  },
  input: {
    ...sharedStyles.input,
    paddingLeft: 44,
  },
  loginButton: {
    ...sharedStyles.primaryButton,
    marginTop: 4,
  },
  loginText: {
    ...sharedStyles.primaryButtonText,
  },
  signupText: {
    color: colors.muted,
    textAlign: "center",
    fontSize: 13,
  },
  signupLink: {
    color: colors.orange,
    fontWeight: "700",
  },
  debugButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radiusLg,
    paddingVertical: 14,
    alignItems: "center",
    ...shadow.soft,
  },
  debugText: {
    color: "#374151",
    fontSize: 15,
    fontWeight: "700",
  },
  demoBox: {
    backgroundColor: colors.blueSoft,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderRadius: spacing.radiusXl,
    padding: 14,
    marginTop: 4,
  },
  demoText: {
    color: "#1e3a8a",
    fontSize: 12,
    lineHeight: 17,
  },
});
