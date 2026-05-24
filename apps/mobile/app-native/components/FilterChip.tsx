import { Pressable, StyleSheet, Text } from "react-native";
import { colors } from "../theme";

interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

export function FilterChip({ label, active, onPress }: FilterChipProps) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export const filterChipStyles = StyleSheet.create({
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterRow: {
    gap: 6,
  },
  filterLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
  },
});

const styles = StyleSheet.create({
  chip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  chipActive: {
    backgroundColor: colors.orangeSoft,
    borderColor: colors.orange,
  },
  chipText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  chipTextActive: {
    color: colors.orange,
  },
});
