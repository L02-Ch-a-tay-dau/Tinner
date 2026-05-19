import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { colors, shadow, sharedStyles, spacing } from "../theme";

interface SignupScreenProps {
  username: string;
  email: string;
  fullName: string;
  password: string;
  confirmPassword: string;
  error: string;
  loading: boolean;
  onUsernameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onFullNameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: () => void;
  onGoToLogin: () => void;
}

export function SignupScreen({
  username,
  email,
  fullName,
  password,
  confirmPassword,
  error,
  loading,
  onUsernameChange,
  onEmailChange,
  onFullNameChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
  onGoToLogin,
}: SignupScreenProps) {
  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.logoWrap}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>⌘</Text>
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Start your food discovery journey</Text>
          </View>

          {!!error && <Text style={sharedStyles.error}>{error}</Text>}

          <View style={styles.field}>
            <Text style={styles.label}>Username</Text>
            <View style={styles.inputWrap}>
              <Text style={styles.inputIcon}>@</Text>
              <TextInput
                value={username}
                onChangeText={onUsernameChange}
                placeholder="your_username"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
              />
            </View>
          </View>

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
                autoCorrect={false}
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              Full Name <Text style={styles.optionalHint}>(optional)</Text>
            </Text>
            <View style={styles.inputWrap}>
              <Text style={styles.inputIcon}>☺</Text>
              <TextInput
                value={fullName}
                onChangeText={onFullNameChange}
                placeholder="John Doe"
                autoCapitalize="words"
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
                autoCapitalize="none"
                style={styles.input}
              />
            </View>
            <Text style={styles.hint}>At least 8 characters, include a letter and a number.</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputWrap}>
              <Text style={styles.inputIcon}>⌕</Text>
              <TextInput
                value={confirmPassword}
                onChangeText={onConfirmPasswordChange}
                placeholder="••••••••"
                secureTextEntry
                autoCapitalize="none"
                style={styles.input}
              />
            </View>
          </View>

          <Pressable style={styles.submitButton} onPress={onSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.submitText}>Create Account</Text>
            )}
          </Pressable>

          <Pressable onPress={onGoToLogin} hitSlop={8}>
            <Text style={styles.loginText}>
              Already have an account? <Text style={styles.loginLink}>Log In</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  card: {
    gap: 14,
  },
  logoWrap: {
    alignItems: "center",
    marginBottom: 8,
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
    fontSize: 28,
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
  optionalHint: {
    color: colors.faint,
    fontWeight: "500",
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
  hint: {
    color: colors.faint,
    fontSize: 12,
    marginTop: 2,
  },
  submitButton: {
    ...sharedStyles.primaryButton,
    marginTop: 6,
  },
  submitText: {
    ...sharedStyles.primaryButtonText,
  },
  loginText: {
    color: colors.muted,
    textAlign: "center",
    fontSize: 13,
    marginTop: 4,
  },
  loginLink: {
    color: colors.orange,
    fontWeight: "700",
  },
});
