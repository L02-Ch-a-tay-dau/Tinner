import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, sharedStyles, shadow, spacing } from "../theme";
import type { LikedFood, NativeFood } from "../types";

interface CollectionsScreenProps {
  likedFoods: LikedFood[];
  onStartSwiping: () => void;
  onRemove: (foodId: string) => void;
  onClearAll: () => void;
  onSelectFood: (foodId: string) => void;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function groupByCuisine(likedFoods: LikedFood[]) {
  return likedFoods.reduce<Record<string, LikedFood[]>>((acc, food) => {
    acc[food.cuisine] = [...(acc[food.cuisine] ?? []), food];
    return acc;
  }, {});
}

export function CollectionsScreen({
  likedFoods,
  onStartSwiping,
  onRemove,
  onClearAll,
  onSelectFood,
}: CollectionsScreenProps) {
  const insets = useSafeAreaInsets();
  const grouped = groupByCuisine(likedFoods);

  const confirmClear = () => {
    Alert.alert("Clear all saved foods?", "This will remove every saved dish.", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear All", style: "destructive", onPress: onClearAll },
    ]);
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
          <Text style={sharedStyles.headerTitle}>My Collection</Text>
          <Text style={sharedStyles.headerSubtitle}>
            {likedFoods.length} saved dish{likedFoods.length !== 1 ? "es" : ""}
          </Text>
        </View>
        {likedFoods.length > 0 && (
          <Pressable onPress={confirmClear}>
            <Text style={styles.clearText}>Clear All</Text>
          </Pressable>
        )}
      </View>

      {likedFoods.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyCircle}>
            <Text style={styles.emptyIcon}>♡</Text>
          </View>
          <Text style={styles.emptyTitle}>No saved dishes yet</Text>
          <Text style={styles.emptyText}>
            Start swiping and save your favorite dishes to find them here later!
          </Text>
          <Pressable style={styles.startButton} onPress={onStartSwiping}>
            <Text style={styles.startButtonText}>Start Swiping</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.groups} showsVerticalScrollIndicator={false}>
          {Object.entries(grouped).map(([cuisine, foods]) => (
            <View key={cuisine} style={styles.group}>
              <Text style={styles.groupTitle}>
                <Text style={styles.groupDot}>● </Text>
                {cuisine} <Text style={styles.groupCount}>({foods.length})</Text>
              </Text>
              <View style={styles.foodList}>
                {foods.map((food) => (
                  <Pressable
                    key={food.foodId}
                    style={styles.foodCard}
                    onPress={() => onSelectFood(food.foodId)}
                  >
                    <Image source={{ uri: food.image }} style={styles.foodImage} />
                    <View style={styles.foodInfo}>
                      <Text style={styles.foodName} numberOfLines={1}>
                        {food.foodName}
                      </Text>
                      <View style={styles.metaRow}>
                        <View style={styles.cuisinePill}>
                          <Text style={styles.cuisineText}>{food.cuisine}</Text>
                        </View>
                        <Text style={styles.dateText}>▣ {formatDate(food.likedAt)}</Text>
                      </View>
                    </View>
                    <Pressable style={styles.deleteButton} onPress={() => onRemove(food.foodId)}>
                      <Text style={styles.deleteText}>✕</Text>
                    </Pressable>
                  </Pressable>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    ...sharedStyles.header,
  },
  clearText: {
    color: colors.red,
    fontSize: 14,
    fontWeight: "700",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  emptyCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyIcon: {
    color: "#d1d5db",
    fontSize: 42,
  },
  emptyTitle: {
    color: "#374151",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
  },
  emptyText: {
    color: colors.faint,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 22,
  },
  startButton: {
    backgroundColor: colors.orange,
    borderRadius: spacing.radiusLg,
    paddingHorizontal: 24,
    paddingVertical: 13,
  },
  startButtonText: {
    color: colors.white,
    fontWeight: "800",
  },
  groups: {
    gap: 24,
    paddingBottom: 24,
  },
  group: {
    gap: 12,
  },
  groupTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  groupDot: {
    color: colors.orange,
  },
  groupCount: {
    color: colors.faint,
    fontSize: 14,
  },
  foodList: {
    gap: 12,
  },
  foodCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: spacing.radiusXl,
    overflow: "hidden",
    ...shadow.soft,
  },
  foodImage: {
    width: 96,
    height: 96,
  },
  foodInfo: {
    flex: 1,
    padding: 12,
  },
  foodName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  cuisinePill: {
    backgroundColor: colors.orangeSoft,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cuisineText: {
    color: colors.orange,
    fontSize: 11,
    fontWeight: "800",
  },
  dateText: {
    color: colors.faint,
    fontSize: 11,
    flex: 1,
  },
  deleteButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: colors.redSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteText: {
    color: colors.red,
    fontSize: 18,
    fontWeight: "800",
  },
});
