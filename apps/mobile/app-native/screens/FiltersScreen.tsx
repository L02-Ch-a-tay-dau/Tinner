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
          <Text style={sharedStyles.headerTitle}>Bộ lọc</Text>
          <Text style={sharedStyles.headerSubtitle}>Tùy chỉnh sở thích</Text>
        </View>
        <Pressable onPress={reset}>
          <Text style={styles.resetText}>Đặt lại</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(user?.name || user?.email || "U").slice(0, 1).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileLabel}>Hồ sơ</Text>
            <View style={styles.profileRow}>
              <Text style={styles.profileKey}>Tên</Text>
              <Text style={styles.profileValue} numberOfLines={1}>
                {user?.name || ""}
              </Text>
            </View>
            <View style={styles.profileRow}>
              <Text style={styles.profileKey}>Email</Text>
              <Text style={styles.profileValue} numberOfLines={1}>
                {user?.email || ""}
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
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.vndInput}
                keyboardType="numeric"
                placeholder="0 vnđ"
                placeholderTextColor="#bbb"
                value={preferences.priceVndMin > 0 ? `${formatVnd(preferences.priceVndMin)} vnđ` : ""}
                onChangeText={(text) =>
                  onChangePreferences({ ...preferences, priceVndMin: parseVnd(text) })
                }
              />
            </View>
            <Text style={styles.vndDash}>–</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.vndInput}
                keyboardType="numeric"
                placeholder="1.000.000 vnđ"
                placeholderTextColor="#bbb"
                value={preferences.priceVndMax < 1000000 ? `${formatVnd(preferences.priceVndMax)} vnđ` : ""}
                onChangeText={(text) =>
                  onChangePreferences({ ...preferences, priceVndMax: parseVnd(text) })
                }
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Khoảng cách tối đa</Text>
          <Text style={styles.sectionSub}>Bạn sẵn sàng đi bao xa?</Text>
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đánh giá tối thiểu</Text>
          <Text style={styles.sectionSub}>Chỉ hiển thị quán có đánh giá từ</Text>
          <View style={styles.stepperRow}>
            <Pressable
              style={styles.stepperButton}
              onPress={() => {
                const currentVal = preferences.minRating ?? 0;
                const nextVal = Math.max(0, parseFloat((currentVal - 0.5).toFixed(1)));
                onChangePreferences({ ...preferences, minRating: nextVal });
              }}
            >
              <Text style={styles.stepperText}>−</Text>
            </Pressable>
            <View style={styles.valueBox}>
              <Text style={styles.valueText}>
                {preferences.minRating === 0 ? "Mọi đánh giá" : `★ ${preferences.minRating.toFixed(1)}+`}
              </Text>
            </View>
            <Pressable
              style={styles.stepperButton}
              onPress={() => {
                const currentVal = preferences.minRating ?? 0;
                const nextVal = Math.min(5, parseFloat((currentVal + 0.5).toFixed(1)));
                onChangePreferences({ ...preferences, minRating: nextVal });
              }}
            >
              <Text style={styles.stepperText}>+</Text>
            </Pressable>
          </View>
        </View>

        <Pressable style={[styles.saveButton, saving && styles.saveButtonDisabled]} onPress={onSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <Text style={styles.saveText}>Lưu thay đổi</Text>
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
    fontSize: 15,
    fontWeight: "700",
  },
  content: {
    gap: 16,
    paddingBottom: 24,
  },
    profileCard: {
      backgroundColor: colors.white,
      borderRadius: spacing.radius2xl,
      borderWidth: 1,
      borderColor: colors.borderLight,
      padding: 16,
      flexDirection: "row",
      gap: 16,
      alignItems: "center",
      ...shadow.soft,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
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
      marginBottom: 8,
    },
    profileRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 16,
      marginTop: 4,
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
      padding: 16,
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
      marginTop: 8,
      marginBottom: 16,
    },
    pills: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    pill: {
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 8,
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
    justifyContent: "space-between",
    marginHorizontal: 0,
  },
  inputContainer: {
    flex: 1,
    maxWidth: 140, // Cho phép box scale nhưng không vượt quá 140px
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  vndInput: {
    width: "100%", // Scale bằng % thay vì flex: 1
    height: 48,
    borderRadius: 16,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: 16,
    fontSize: 15,
    color: colors.text,
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
    gap: 16,
  },
  stepperButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
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
    height: 48,
    borderRadius: 16,
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
    borderRadius: 24,
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
