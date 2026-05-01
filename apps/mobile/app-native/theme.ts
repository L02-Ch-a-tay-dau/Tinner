import { StyleSheet } from "react-native";

export const colors = {
  background: "#f8fafc",
  white: "#ffffff",
  text: "#111827",
  muted: "#6b7280",
  faint: "#9ca3af",
  border: "#e5e7eb",
  borderLight: "#f3f4f6",
  orange: "#f97316",
  orangeDark: "#ea580c",
  orangeSoft: "#fff7ed",
  red: "#ef4444",
  redSoft: "#fef2f2",
  green: "#10b981",
  greenSoft: "#ecfdf5",
  blue: "#3b82f6",
  blueSoft: "#eff6ff",
  amber: "#f59e0b",
  black: "#000000",
};

export const spacing = {
  screenX: 16,
  navHeight: 72,
  radiusMd: 12,
  radiusLg: 16,
  radiusXl: 20,
  radius2xl: 24,
  radius3xl: 30,
};

export const shadow = {
  card: {
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 5,
  },
  soft: {
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
};

export const sharedStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.screenX,
  },
  screenWithNav: {
    paddingBottom: spacing.navHeight + 12,
  },
  header: {
    paddingTop: 10,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "700",
  },
  headerSubtitle: {
    color: colors.faint,
    fontSize: 12,
    marginTop: 2,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.soft,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: spacing.radius2xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadow.soft,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: "#f9fafb",
  },
  chipText: {
    color: "#374151",
    fontSize: 13,
  },
  primaryButton: {
    backgroundColor: colors.orange,
    borderRadius: spacing.radiusLg,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radiusLg,
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: colors.text,
    fontSize: 15,
  },
  error: {
    backgroundColor: colors.redSoft,
    borderWidth: 1,
    borderColor: "#fecaca",
    color: "#b91c1c",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: spacing.radiusLg,
    fontSize: 13,
  },
});
