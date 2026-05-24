import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, shadow, spacing } from "../theme";

interface SettingsGroupProps {
  title: string;
  children: ReactNode;
}

export function SettingsGroup({ title, children }: SettingsGroupProps) {
  return (
    <View style={styles.wrap}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <View style={styles.card}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 16,
  },
  title: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 6,
    marginLeft: 4,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusXl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: "hidden",
    ...shadow.soft,
  },
});
