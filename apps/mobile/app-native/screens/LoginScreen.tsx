import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, shadow, sharedStyles, spacing } from "../theme";

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
  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <View style={styles.logoWrap}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>⌘</Text>
          </View>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Log in to continue swiping</Text>
        </View>

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
    width: 64,
    height: 64,
    borderRadius: spacing.radius2xl,
    backgroundColor: colors.orange,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    ...shadow.soft,
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
});
