import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, sharedStyles, shadow, spacing } from "../theme";
import { defaultPreferences, type UserPreferences, type UserProfile } from "../types";

interface FiltersScreenProps {
  user: UserProfile | null;
  preferences: UserPreferences;
  onChangePreferences: (preferences: UserPreferences) => void;
  onReset: () => void;
  onSave: () => void;
}

const cuisineOptions = [
  "American",
  "Japanese",
  "Italian",
  "Thai",
  "Mexican",
  "Indian",
  "Steakhouse",
  "Chinese",
  "French",
  "Mediterranean",
];
const dietaryOptions = ["Vegetarian", "Vegan", "Gluten-Free", "Halal", "Kosher", "Dairy-Free", "Nut-Free"];
const priceOptions = ["$", "$$", "$$$", "$$$$"];

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

interface PillGroupProps {
  title: string;
  subtitle: string;
  items: string[];
  selected: string[];
  color: "orange" | "green" | "blue";
  onToggle: (item: string) => void;
}

function PillGroup({ title, subtitle, items, selected, color, onToggle }: PillGroupProps) {
  const activeColor = color === "orange" ? colors.orange : color === "green" ? colors.green : colors.blue;
  const activeSoft = color === "orange" ? colors.orangeSoft : color === "green" ? colors.greenSoft : colors.blueSoft;
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

export function FiltersScreen({
  user,
  preferences,
  onChangePreferences,
  onReset,
  onSave,
}: FiltersScreenProps) {
  const insets = useSafeAreaInsets();
  const reset = () => {
    onChangePreferences(defaultPreferences);
    onReset();
  };

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
          title="Cuisines"
          subtitle={preferences.cuisines.length === 0 ? "All cuisines included" : `${preferences.cuisines.length} selected`}
          items={cuisineOptions}
          selected={preferences.cuisines}
          color="orange"
          onToggle={(cuisine) =>
            onChangePreferences({ ...preferences, cuisines: toggle(preferences.cuisines, cuisine) })
          }
        />
        <PillGroup
          title="Dietary Preferences"
          subtitle={
            preferences.dietaryRestrictions.length === 0
              ? "No restrictions"
              : `${preferences.dietaryRestrictions.length} selected`
          }
          items={dietaryOptions}
          selected={preferences.dietaryRestrictions}
          color="green"
          onToggle={(dietary) =>
            onChangePreferences({
              ...preferences,
              dietaryRestrictions: toggle(preferences.dietaryRestrictions, dietary),
            })
          }
        />
        <PillGroup
          title="Price Range"
          subtitle={preferences.priceRange.length === 4 ? "All prices" : preferences.priceRange.join(", ")}
          items={priceOptions}
          selected={preferences.priceRange}
          color="blue"
          onToggle={(price) =>
            onChangePreferences({ ...preferences, priceRange: toggle(preferences.priceRange, price) })
          }
        />

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
              onPress={() => onChangePreferences({ ...preferences, maxDistance: Math.min(20, preferences.maxDistance + 1) })}
            >
              <Text style={styles.stepperText}>+</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Minimum Rating</Text>
          <Text style={styles.sectionSub}>Only show highly rated places</Text>
          <View style={styles.stepperRow}>
            <Pressable
              style={styles.stepperButton}
              onPress={() =>
                onChangePreferences({ ...preferences, minRating: Math.max(0, Number((preferences.minRating - 0.5).toFixed(1))) })
              }
            >
              <Text style={styles.stepperText}>−</Text>
            </Pressable>
            <View style={styles.valueBox}>
              <Text style={styles.valueText}>★ {preferences.minRating.toFixed(1)}</Text>
            </View>
            <Pressable
              style={styles.stepperButton}
              onPress={() =>
                onChangePreferences({ ...preferences, minRating: Math.min(5, Number((preferences.minRating + 0.5).toFixed(1))) })
              }
            >
              <Text style={styles.stepperText}>+</Text>
            </Pressable>
          </View>
        </View>

        <Pressable style={styles.saveButton} onPress={onSave}>
          <Text style={styles.saveText}>Save Preferences</Text>
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
  saveText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "900",
  },
});
