import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, sharedStyles, shadow, spacing } from "../theme";
import { CUISINE_OPTIONS, defaultPreferences, type UserPreferences, type UserProfile } from "../types";

interface FiltersScreenProps {
  user: UserProfile | null;
  preferences: UserPreferences;
  saving?: boolean;
  onChangePreferences: (preferences: UserPreferences) => void;
  onReset: () => void;
  onSave: () => void;
}

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

interface PillGroupProps {
  title: string;
  subtitle: string;
  items: string[];
  selected: string[];
  color: "orange" | "green";
  onToggle: (item: string) => void;
}

function PillGroup({ title, subtitle, items, selected, color, onToggle }: PillGroupProps) {
  const activeColor = color === "orange" ? colors.orange : colors.green;
  const activeSoft = color === "orange" ? colors.orangeSoft : colors.greenSoft;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSub}>{subtitle}</Text>
      <View style={styles.pills}>
        {items.map((item) => {
          const isSelected = selected.includes(item);
          return (
            <Pressable
              key={item}
              onPress={() => onToggle(item)}
              style={[
                styles.pill,
                isSelected && { backgroundColor: activeColor, shadowColor: activeColor },
                !isSelected && { backgroundColor: activeSoft },
              ]}
            >
              <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                {isSelected ? "✓ " : ""}
                {item}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function formatVnd(value: number): string {
  return value.toLocaleString("vi-VN");
}

function parseVnd(text: string): number {
  return Number(text.replaceAll(/[^0-9]/g, "")) || 0;
}

export function FiltersScreen({
  user,
  preferences,
  saving,
  onChangePreferences,
  onReset,
  onSave,
}: FiltersScreenProps) {
  const insets = useSafeAreaInsets();
  const reset = () => {
    onChangePreferences(defaultPreferences);
    onReset();
  };

  const priceSubtitle =
    preferences.priceVndMin <= 0 && preferences.priceVndMax >= 1000000
      ? "Tất cả mức giá"
      : `${formatVnd(preferences.priceVndMin)}đ – ${formatVnd(preferences.priceVndMax)}đ`;

  return (
    <View
      style={[
        sharedStyles.screen,
        { paddingBottom: spacing.navHeight + Math.max(12, insets.bottom + 8) },
      ]}
    >
      <View style={styles.header}>
        <View>
          <Text style={sharedStyles.headerTitle}>Smart Filters</Text>
          <Text style={sharedStyles.headerSubtitle}>Customize your preferences</Text>
        </View>
        <Pressable onPress={reset}>
          <Text style={styles.resetText}>Reset All</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(user?.name || user?.email || "G").slice(0, 1).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileLabel}>Profile</Text>
            <View style={styles.profileRow}>
              <Text style={styles.profileKey}>Name</Text>
              <Text style={styles.profileValue} numberOfLines={1}>
                {user?.name || "Guest"}
              </Text>
            </View>
            <View style={styles.profileRow}>
              <Text style={styles.profileKey}>Email</Text>
              <Text style={styles.profileValue} numberOfLines={1}>
                {user?.email || "guest@tinner.app"}
              </Text>
            </View>
          </View>
        </View>

        <PillGroup
          title="Loại quán"
          subtitle={preferences.cuisines.length === 0 ? "Tất cả" : `${preferences.cuisines.length} loại`}
          items={CUISINE_OPTIONS}
          selected={preferences.cuisines}
          color="orange"
          onToggle={(cuisine) =>
            onChangePreferences({ ...preferences, cuisines: toggle(preferences.cuisines, cuisine) })
          }
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Khoảng giá</Text>
          <Text style={styles.sectionSub}>{priceSubtitle}</Text>
          <View style={styles.vndRow}>
            <TextInput
              style={styles.vndInput}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#bbb"
              value={preferences.priceVndMin > 0 ? String(preferences.priceVndMin) : ""}
              onChangeText={(text) =>
                onChangePreferences({ ...preferences, priceVndMin: parseVnd(text) })
              }
            />
            <Text style={styles.vndLabel}>₫</Text>
            <Text style={styles.vndDash}>–</Text>
            <TextInput
              style={styles.vndInput}
              keyboardType="numeric"
              placeholder="1.000.000"
              placeholderTextColor="#bbb"
              value={preferences.priceVndMax < 1000000 ? String(preferences.priceVndMax) : ""}
              onChangeText={(text) =>
                onChangePreferences({ ...preferences, priceVndMax: parseVnd(text) })
              }
            />
            <Text style={styles.vndLabel}>₫</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Maximum Distance</Text>
          <Text style={styles.sectionSub}>How far are you willing to go?</Text>
          <View style={styles.stepperRow}>
            <Pressable
              style={styles.stepperButton}
              onPress={() => onChangePreferences({ ...preferences, maxDistance: Math.max(1, preferences.maxDistance - 1) })}
            >
              <Text style={styles.stepperText}>−</Text>
            </Pressable>
            <View style={styles.valueBox}>
              <Text style={styles.valueText}>{preferences.maxDistance} km</Text>
            </View>
            <Pressable
              style={styles.stepperButton}
              onPress={() => onChangePreferences({ ...preferences, maxDistance: Math.min(7, preferences.maxDistance + 1) })}
            >
              <Text style={styles.stepperText}>+</Text>
            </Pressable>
          </View>
        </View>

        <Pressable style={[styles.saveButton, saving && styles.saveButtonDisabled]} onPress={onSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <Text style={styles.saveText}>Save Preferences</Text>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    ...sharedStyles.header,
  },
  resetText: {
    color: colors.orange,
    fontSize: 14,
    fontWeight: "800",
  },
  content: {
    gap: 18,
    paddingBottom: 26,
  },
  profileCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.radius2xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 18,
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
    ...shadow.soft,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.orangeSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.orange,
    fontSize: 18,
    fontWeight: "900",
  },
  profileLabel: {
    color: colors.faint,
    fontSize: 12,
    marginBottom: 6,
  },
  profileRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 3,
  },
  profileKey: {
    color: colors.muted,
    fontSize: 13,
  },
  profileValue: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "right",
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: spacing.radius2xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 18,
    ...shadow.soft,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "800",
  },
  sectionSub: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 6,
    marginBottom: 14,
  },
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },
  pill: {
    borderRadius: 13,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  pillText: {
    color: "#374151",
    fontSize: 13,
    fontWeight: "700",
  },
  pillTextActive: {
    color: colors.white,
  },
  vndRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  vndInput: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.text,
    fontWeight: "700",
  },
  vndLabel: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "700",
  },
  vndDash: {
    color: colors.muted,
    fontSize: 16,
    fontWeight: "800",
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stepperButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.orangeSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperText: {
    color: colors.orange,
    fontSize: 24,
    fontWeight: "900",
  },
  valueBox: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#f9fafb",
    alignItems: "center",
    justifyContent: "center",
  },
  valueText: {
    color: colors.text,
    fontWeight: "800",
  },
  saveButton: {
    backgroundColor: colors.orange,
    borderRadius: spacing.radiusXl,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "900",
  },
});
