import { ActivityIndicator, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FoodSwipeCard } from "../components/FoodSwipeCard";
import { RestaurantPanel } from "../components/RestaurantPanel";
import { colors, sharedStyles, shadow, spacing } from "../theme";
import { type NativeFood, type UserProfile } from "../types";

interface SwipeScreenProps {
  deck: NativeFood[];
  loading: boolean;
  error: string;
  likedCount: number;
  skippedCount: number;
  selectedFood: NativeFood | null;
  user: UserProfile | null;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onReset: () => void;
  onLogout: () => void;
  onClosePanel: () => void;
}

export function SwipeScreen({
  deck,
  loading,
  error,
  likedCount,
  skippedCount,
  selectedFood,
  user,
  onSwipeLeft,
  onSwipeRight,
  onReset,
  onLogout,
  onClosePanel,
}: SwipeScreenProps) {
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const topFood = deck.at(-1);
  const secondFood = deck.at(-2);
  const thirdFood = deck.at(-3);
  const swipeEnabled = !selectedFood;
  const cardHeight = Math.min(520, Math.max(340, Math.round(windowHeight * 0.54)));
  const screenWithNavStyle = {
    paddingBottom: spacing.navHeight + Math.max(12, insets.bottom + 8),
  };

  return (
    <View style={[sharedStyles.screen, screenWithNavStyle]}>
      <View style={styles.header}>
        <View>
          <View style={styles.brandRow}>
            <View style={styles.brandIcon}>
              <Text style={styles.brandIconText}>⌘</Text>
            </View>
            <Text style={styles.brandTitle}>Tinner</Text>
          </View>
          <Text style={styles.brandSub}>Find your next craving</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: "#f87171" }]}>{skippedCount}</Text>
            <Text style={styles.statLabel}>skipped</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.green }]}>{likedCount}</Text>
            <Text style={styles.statLabel}>liked</Text>
          </View>
          <Pressable style={styles.userButton} onPress={onLogout}>
            <Text style={styles.userIcon}>{(user?.name ?? "G").slice(0, 1).toUpperCase()}</Text>
          </Pressable>
        </View>
      </View>

      {!!error && <Text style={[sharedStyles.error, styles.error]}>{error}</Text>}

      <View style={styles.deckArea}>
        <View style={[styles.cardContainer, { height: cardHeight }]}>
          {loading ? (
            <View style={styles.emptyCard}>
              <ActivityIndicator color={colors.orange} size="large" />
              <Text style={styles.emptyTitle}>Loading nearby places...</Text>
            </View>
          ) : deck.length === 0 ? (
            <View style={styles.emptyCard}>
              {likedCount === 0 && skippedCount === 0 ? (
                <>
                  <Text style={styles.emptyEmoji}>📍</Text>
                  <Text style={styles.emptyTitle}>No nearby places</Text>
                  <Text style={styles.emptyText}>
                    The suggestions API returned no restaurants in range. Try again or open Filters to relax distance
                    or rating.
                  </Text>
                  <Pressable style={styles.startOverButton} onPress={onReset}>
                    <Text style={styles.startOverText}>↻ Retry</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Text style={styles.emptyEmoji}>🍽️</Text>
                  <Text style={styles.emptyTitle}>You've seen it all!</Text>
                  <Text style={styles.emptyText}>
                    You liked {likedCount} place{likedCount !== 1 ? "s" : ""}. Ready for another round?
                  </Text>
                  <Pressable style={styles.startOverButton} onPress={onReset}>
                    <Text style={styles.startOverText}>↻ Start Over</Text>
                  </Pressable>
                </>
              )}
            </View>
          ) : (
            <>
              {thirdFood && (
                <FoodSwipeCard
                  key={`third-${thirdFood.id}`}
                  food={thirdFood}
                  isTop={false}
                  swipeEnabled={false}
                  stackIndex={2}
                  onSwipeLeft={() => undefined}
                  onSwipeRight={() => undefined}
                />
              )}
              {secondFood && (
                <FoodSwipeCard
                  key={`second-${secondFood.id}`}
                  food={secondFood}
                  isTop={false}
                  swipeEnabled={false}
                  stackIndex={1}
                  onSwipeLeft={() => undefined}
                  onSwipeRight={() => undefined}
                />
              )}
              {topFood && (
                <FoodSwipeCard
                  key={`top-${topFood.id}`}
                  food={topFood}
                  isTop
                  swipeEnabled={swipeEnabled}
                  stackIndex={0}
                  onSwipeLeft={onSwipeLeft}
                  onSwipeRight={onSwipeRight}
                />
              )}
            </>
          )}
        </View>

        {deck.length > 0 && !loading && (
          <>
            <View style={styles.remainingRow}>
              <Text style={styles.remainingText}>
                ✨ {deck.length} place{deck.length !== 1 ? "s" : ""} remaining
              </Text>
            </View>
            <View style={styles.actions}>
              <Pressable style={styles.actionButton} onPress={onSwipeLeft} disabled={!swipeEnabled}>
                <Text style={[styles.actionIcon, { color: colors.red }]}>×</Text>
              </Pressable>
              <Pressable style={styles.resetButton} onPress={onReset} disabled={!swipeEnabled}>
                <Text style={styles.resetText}>↻</Text>
              </Pressable>
              <Pressable style={styles.actionButton} onPress={onSwipeRight} disabled={!swipeEnabled}>
                <Text style={[styles.actionIcon, { color: colors.green }]}>♥</Text>
              </Pressable>
            </View>
          </>
        )}
      </View>

      <RestaurantPanel food={selectedFood} onClose={onClosePanel} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 8,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brandIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.orange,
    alignItems: "center",
    justifyContent: "center",
  },
  brandIconText: {
    color: colors.white,
    fontWeight: "900",
    fontSize: 18,
  },
  brandTitle: {
    color: colors.text,
    fontSize: 21,
    fontWeight: "800",
  },
  brandSub: {
    color: colors.faint,
    fontSize: 12,
    marginLeft: 42,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  stat: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
  },
  statLabel: {
    color: colors.faint,
    fontSize: 10,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
  },
  userButton: {
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
  userIcon: {
    color: colors.muted,
    fontWeight: "800",
  },
  error: {
    marginBottom: 8,
  },
  deckArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cardContainer: {
    width: "100%",
    position: "relative",
  },
  emptyCard: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: spacing.radius3xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: "rgba(255,255,255,0.88)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    ...shadow.soft,
  },
  emptyEmoji: {
    fontSize: 52,
    marginBottom: 12,
  },
  emptyTitle: {
    color: "#374151",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 10,
  },
  emptyText: {
    color: colors.faint,
    textAlign: "center",
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  startOverButton: {
    backgroundColor: colors.orange,
    borderRadius: spacing.radiusLg,
    paddingHorizontal: 22,
    paddingVertical: 13,
    marginTop: 20,
  },
  startOverText: {
    color: colors.white,
    fontWeight: "800",
  },
  remainingRow: {
    marginTop: 14,
  },
  remainingText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 28,
    marginTop: 14,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.soft,
  },
  actionIcon: {
    fontSize: 34,
    fontWeight: "700",
    lineHeight: 38,
  },
  resetButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.soft,
  },
  resetText: {
    color: colors.faint,
    fontSize: 18,
    fontWeight: "800",
  },
});
