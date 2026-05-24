import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";

interface SettingsRowProps {
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  destructive?: boolean;
  isLast?: boolean;
  accessibilityLabel?: string;
}

export function SettingsRow({
  label,
  value,
  onPress,
  showChevron = !!onPress,
  destructive = false,
  isLast = false,
  accessibilityLabel,
}: SettingsRowProps) {
  const content = (
    <>
      <Text style={[styles.label, destructive && styles.destructiveLabel]} numberOfLines={1}>
        {label}
      </Text>
      <View style={styles.trailing}>
        {value ? (
          <Text style={[styles.value, destructive && styles.destructiveLabel]} numberOfLines={1}>
            {value}
          </Text>
        ) : null}
        {showChevron && onPress ? <Text style={styles.chevron}>›</Text> : null}
      </View>
    </>
  );

  if (!onPress) {
    return (
      <View style={[styles.row, !isLast && styles.rowBorder]} accessibilityLabel={accessibilityLabel}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [styles.row, !isLast && styles.rowBorder, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  pressed: {
    backgroundColor: "#f9fafb",
  },
  label: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: "500",
  },
  destructiveLabel: {
    color: colors.red,
  },
  trailing: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    maxWidth: "55%",
  },
  value: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: "500",
    textAlign: "right",
  },
  chevron: {
    color: colors.faint,
    fontSize: 22,
    fontWeight: "300",
    marginTop: -2,
  },
});
