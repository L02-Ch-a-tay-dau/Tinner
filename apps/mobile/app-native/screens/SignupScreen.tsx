import { useRef } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardFormContainer } from "../components/KeyboardFormContainer";
import { colors, sharedStyles } from "../theme";

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
  const insets = useSafeAreaInsets();
  const emailRef = useRef<TextInput>(null);
  const fullNameRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  return (
    <KeyboardFormContainer keyboardVerticalOffset={insets.top}>
      <View style={styles.card}>
        <View style={styles.logoWrap}>
          <Image source={require("../../assets/tinner_logo.png")} style={styles.logo} />
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
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => emailRef.current?.focus()}
              style={styles.input}
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrap}>
            <Text style={styles.inputIcon}>✉</Text>
            <TextInput
              ref={emailRef}
              value={email}
              onChangeText={onEmailChange}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => fullNameRef.current?.focus()}
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
              ref={fullNameRef}
              value={fullName}
              onChangeText={onFullNameChange}
              placeholder="John Doe"
              autoCapitalize="words"
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => passwordRef.current?.focus()}
              style={styles.input}
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrap}>
            <Text style={styles.inputIcon}>⌕</Text>
            <TextInput
              ref={passwordRef}
              value={password}
              onChangeText={onPasswordChange}
              placeholder="••••••••"
              secureTextEntry
              autoCapitalize="none"
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => confirmPasswordRef.current?.focus()}
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
              ref={confirmPasswordRef}
              value={confirmPassword}
              onChangeText={onConfirmPasswordChange}
              placeholder="••••••••"
              secureTextEntry
              autoCapitalize="none"
              returnKeyType="go"
              onSubmitEditing={onSubmit}
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
    </KeyboardFormContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 14,
  },
  logoWrap: {
    alignItems: "center",
    marginBottom: 8,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: "contain",
    marginBottom: 16,
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
