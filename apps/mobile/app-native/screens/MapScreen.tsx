import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FilterChip, filterChipStyles } from "../components/FilterChip";
import { colors, sharedStyles, shadow, spacing } from "../theme";
import type { NativeFood, NativeRestaurant } from "../types";

const PAGE_SIZE = 20;

type MapRestaurant = NativeRestaurant & { foodName: string; cuisine: string };

interface MapScreenProps {
  foods: NativeFood[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onOpenFilters: () => void;
  emptyHint?: string;
}

function collectRestaurants(foods: NativeFood[]) {
  return foods
    .flatMap((food) =>
      food.restaurants.map((restaurant) => ({
        ...restaurant,
        foodName: food.name,
        cuisine: food.cuisine,
      })),
    )
    .sort((a, b) => a.distanceNum - b.distanceNum);
}

function RestaurantRow({ restaurant }: { restaurant: MapRestaurant }) {
  const openMaps = () =>
    Linking.openURL(
      `https://www.google.com/maps/search/${encodeURIComponent(`${restaurant.name} ${restaurant.address}`)}`,
    );

  return (
    <View style={styles.restaurantCard}>
      <View style={styles.rowMain}>
        <Image source={{ uri: restaurant.image }} style={styles.image} />
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {restaurant.name}
            </Text>
            <View style={[styles.status, restaurant.isOpen ? styles.statusOpen : styles.statusClosed]}>
              <Text style={[styles.statusText, restaurant.isOpen ? styles.statusTextOpen : styles.statusTextClosed]}>
                {restaurant.isOpen ? "Open" : "Closed"}
              </Text>
            </View>
          </View>
          <Text style={styles.rating}>
            ★ {restaurant.rating.toFixed(1)} ({restaurant.reviews.toLocaleString()}) · {restaurant.price}
          </Text>
          <View style={styles.foodPill}>
            <Text style={styles.foodPillText}>{restaurant.foodName}</Text>
          </View>
          <Text style={styles.address} numberOfLines={1}>
            ⌖ {restaurant.address}
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        <Pressable style={styles.distanceButton} onPress={openMaps}>
          <Text style={styles.distanceText}>⌖ {restaurant.distance} away</Text>
        </Pressable>
        <Pressable style={styles.viewButton} onPress={openMaps}>
          <Text style={styles.viewText}>↗ View</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function MapScreen({
  foods,
  searchQuery,
  onSearchChange,
  onOpenFilters,
  emptyHint,
}: MapScreenProps) {
  const insets = useSafeAreaInsets();
  const [minRating, setMinRating] = useState(0);
  const [maxDistanceKm, setMaxDistanceKm] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const allRestaurants = useMemo(() => collectRestaurants(foods), [foods]);
  const query = searchQuery.trim().toLowerCase();

  const filtered = useMemo(() => {
    return allRestaurants.filter((restaurant) => {
      if (query) {
        const haystack = `${restaurant.name} ${restaurant.foodName} ${restaurant.cuisine} ${restaurant.address}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      if (minRating > 0 && restaurant.rating < minRating) return false;
      if (maxDistanceKm != null && restaurant.distanceNum > maxDistanceKm) return false;
      return true;
    });
  }, [allRestaurants, query, minRating, maxDistanceKm]);

  const visible = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);
  const hasMore = visible.length < filtered.length;

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query, minRating, maxDistanceKm, foods.length]);

  const loadMore = useCallback(() => {
    if (!hasMore) return;
    setVisibleCount((prev) => prev + PAGE_SIZE);
  }, [hasMore]);

  const listHeader = (
    <>
      <View style={styles.header}>
        <View>
          <Text style={sharedStyles.headerTitle}>Nearby Restaurants</Text>
          <Text style={sharedStyles.headerSubtitle}>
            {filtered.length} location{filtered.length !== 1 ? "s" : ""} found
          </Text>
        </View>
        <Pressable style={sharedStyles.iconButton} onPress={onOpenFilters}>
          <Text style={styles.filterIcon}>☷</Text>
        </Pressable>
      </View>

      {/* <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Search restaurants or dishes..."
          placeholderTextColor={colors.faint}
        />
      </View> */}

      <View style={filterChipStyles.filterRow}>
        <Text style={filterChipStyles.filterLabel}>Rating</Text>
        <View style={filterChipStyles.chipRow}>
          <FilterChip label="All" active={minRating === 0} onPress={() => setMinRating(0)} />
          <FilterChip label="3+" active={minRating === 3} onPress={() => setMinRating(3)} />
          <FilterChip label="4+" active={minRating === 4} onPress={() => setMinRating(4)} />
        </View>
      </View>

      <View style={[filterChipStyles.filterRow, styles.filterBlock]}>
        <Text style={filterChipStyles.filterLabel}>Distance</Text>
        <View style={filterChipStyles.chipRow}>
          <FilterChip label="All" active={maxDistanceKm == null} onPress={() => setMaxDistanceKm(null)} />
          <FilterChip label="≤1 km" active={maxDistanceKm === 1} onPress={() => setMaxDistanceKm(1)} />
          <FilterChip label="≤3 km" active={maxDistanceKm === 3} onPress={() => setMaxDistanceKm(3)} />
          <FilterChip label="≤5 km" active={maxDistanceKm === 5} onPress={() => setMaxDistanceKm(5)} />
        </View>
      </View>
    </>
  );

  return (
    <View
      style={[
        sharedStyles.screen,
        { paddingBottom: spacing.navHeight + Math.max(12, insets.bottom + 8) },
      ]}
    >
      <FlatList
        data={visible}
        keyExtractor={(item) => `${item.id}-${item.foodName}`}
        renderItem={({ item }) => <RestaurantRow restaurant={item} />}
        ListHeaderComponent={listHeader}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onEndReached={loadMore}
        onEndReachedThreshold={0.35}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>⌕</Text>
            <Text style={styles.emptyTitle}>No restaurants found</Text>
            <Text style={styles.emptyText}>
              {foods.length === 0 && emptyHint ? emptyHint : "Try adjusting search or filters"}
            </Text>
          </View>
        }
        ListFooterComponent={
          hasMore ? (
            <View style={styles.footer}>
              <Text style={styles.footerText}>Scroll for more...</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    ...sharedStyles.header,
  },
  filterIcon: {
    color: colors.muted,
    fontSize: 18,
    fontWeight: "800",
  },
  searchWrap: {
    position: "relative",
    justifyContent: "center",
    marginBottom: 14,
  },
  searchIcon: {
    position: "absolute",
    left: 16,
    zIndex: 1,
    color: colors.faint,
    fontSize: 18,
  },
  searchInput: {
    ...sharedStyles.input,
    paddingLeft: 46,
  },
  filterBlock: {
    marginBottom: 12,
  },
  list: {
    gap: 12,
    paddingBottom: 24,
  },
  restaurantCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusXl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: "hidden",
    marginBottom: 12,
    ...shadow.soft,
  },
  rowMain: {
    flexDirection: "row",
  },
  image: {
    width: 112,
    height: 112,
  },
  info: {
    flex: 1,
    padding: 12,
    gap: 5,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  status: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusOpen: {
    backgroundColor: colors.greenSoft,
  },
  statusClosed: {
    backgroundColor: colors.redSoft,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800",
  },
  statusTextOpen: {
    color: "#059669",
  },
  statusTextClosed: {
    color: colors.red,
  },
  rating: {
    color: colors.amber,
    fontSize: 12,
    fontWeight: "700",
  },
  foodPill: {
    alignSelf: "flex-start",
    backgroundColor: colors.orangeSoft,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  foodPillText: {
    color: colors.orange,
    fontSize: 11,
    fontWeight: "800",
  },
  address: {
    color: colors.muted,
    fontSize: 12,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  distanceButton: {
    flex: 1,
    backgroundColor: colors.orangeSoft,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  distanceText: {
    color: colors.orange,
    fontSize: 12,
    fontWeight: "800",
  },
  viewButton: {
    backgroundColor: colors.blueSoft,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
    alignItems: "center",
  },
  viewText: {
    color: colors.blue,
    fontSize: 12,
    fontWeight: "800",
  },
  empty: {
    alignItems: "center",
    paddingVertical: 52,
  },
  emptyIcon: {
    color: "#d1d5db",
    fontSize: 48,
  },
  emptyTitle: {
    color: colors.muted,
    fontSize: 16,
    fontWeight: "800",
    marginTop: 12,
  },
  emptyText: {
    color: colors.faint,
    fontSize: 13,
    marginTop: 4,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  footer: {
    paddingVertical: 16,
    alignItems: "center",
  },
  footerText: {
    color: colors.faint,
    fontSize: 12,
  },
});
