import {
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, shadow, spacing } from "../theme";
import type { NativeFood, NativeRestaurant } from "../types";

interface RestaurantPanelProps {
  food: NativeFood | null;
  onClose: () => void;
}

function StarRating({ rating }: { rating: number }) {
  return <Text style={styles.ratingStars}>{"★".repeat(Math.max(1, Math.round(rating)))}</Text>;
}

function RestaurantCard({ restaurant }: { restaurant: NativeRestaurant }) {
  const openMaps = () => {
    const url = `https://www.google.com/maps/search/${encodeURIComponent(
      `${restaurant.name} ${restaurant.address}`,
    )}`;
    void Linking.openURL(url);
  };

  return (
    <View style={styles.restaurantCard}>
      <Image source={{ uri: restaurant.image }} style={styles.restaurantImage} />
      <View style={styles.restaurantInfo}>
        <View style={styles.restaurantHeader}>
          <Text style={styles.restaurantName} numberOfLines={1}>
            {restaurant.name}
          </Text>
          <View style={[styles.openPill, restaurant.isOpen ? styles.open : styles.closed]}>
            <Text style={[styles.openText, restaurant.isOpen ? styles.openTextOn : styles.closedText]}>
              {restaurant.isOpen ? "Open" : "Closed"}
            </Text>
          </View>
        </View>
        <View style={styles.ratingRow}>
          <StarRating rating={restaurant.rating} />
          <Text style={styles.ratingText}>{restaurant.rating.toFixed(1)}</Text>
          <Text style={styles.mutedText}>({restaurant.reviews.toLocaleString()}) · {restaurant.price}</Text>
        </View>
        <Text style={styles.address} numberOfLines={1}>
          ⌖ {restaurant.address}
        </Text>
        <View style={styles.restaurantFooter}>
          <View style={styles.distancePill}>
            <Text style={styles.distanceText}>⌖ {restaurant.distance} away</Text>
          </View>
          <Pressable onPress={openMaps}>
            <Text style={styles.mapsText}>Maps ↗</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export function RestaurantPanel({ food, onClose }: RestaurantPanelProps) {
  const insets = useSafeAreaInsets();
  const panelBottomPadding = Math.max(22, insets.bottom + 12);

  return (
    <Modal animationType="slide" transparent visible={!!food} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        {food && (
          <View style={[styles.panel, { paddingBottom: panelBottomPadding }]}>
            <View style={styles.handle} />
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text style={styles.nearbyText}>● {food.restaurants.length} restaurants nearby</Text>
                <Text style={styles.panelTitle}>
                  Places serving <Text style={styles.orangeText}>{food.name}</Text>
                </Text>
              </View>
              <Pressable style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeText}>×</Text>
              </Pressable>
            </View>

            <View style={styles.preview}>
              <Image source={{ uri: food.image }} style={styles.previewImage} />
              <View style={{ flex: 1 }}>
                <Text style={styles.previewTitle} numberOfLines={1}>
                  {food.name}
                </Text>
                <Text style={styles.previewSub} numberOfLines={1}>
                  {food.description}
                </Text>
              </View>
              <View style={styles.previewTag}>
                <Text style={styles.previewTagText}>{food.tags[0]}</Text>
              </View>
            </View>

            <Text style={styles.sortHint}>⌖ Sorted by distance from you</Text>

            <ScrollView contentContainerStyle={styles.list}>
              {[...food.restaurants]
                .sort((a, b) => a.distanceNum - b.distanceNum)
                .map((restaurant) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}
              <Pressable
                style={styles.googleButton}
                onPress={() =>
                  Linking.openURL(
                    `https://www.google.com/maps/search/${encodeURIComponent(`${food.name} restaurant near me`)}`,
                  )
                }
              >
                <Text style={styles.googleButtonText}>⌖ View all on Google Maps ›</Text>
              </Pressable>
            </ScrollView>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  panel: {
    maxHeight: "85%",
    backgroundColor: colors.background,
    borderTopLeftRadius: spacing.radius3xl,
    borderTopRightRadius: spacing.radius3xl,
    paddingBottom: 22,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#d1d5db",
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  nearbyText: {
    color: colors.green,
    fontSize: 13,
    fontWeight: "600",
  },
  panelTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 4,
  },
  orangeText: {
    color: colors.orange,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  closeText: {
    color: colors.muted,
    fontSize: 28,
    lineHeight: 30,
  },
  preview: {
    marginHorizontal: 20,
    marginTop: 4,
    backgroundColor: colors.white,
    borderRadius: spacing.radiusXl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  previewImage: {
    width: 52,
    height: 52,
    borderRadius: 14,
  },
  previewTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  previewSub: {
    color: colors.faint,
    fontSize: 12,
    marginTop: 3,
  },
  previewTag: {
    backgroundColor: colors.orangeSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  previewTagText: {
    color: colors.orange,
    fontSize: 11,
    fontWeight: "700",
  },
  sortHint: {
    color: colors.faint,
    fontSize: 12,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  list: {
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 20,
  },
  restaurantCard: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: spacing.radiusXl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: "hidden",
    ...shadow.soft,
  },
  restaurantImage: {
    width: 112,
    height: 112,
  },
  restaurantInfo: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  restaurantHeader: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  restaurantName: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  openPill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  open: {
    backgroundColor: colors.greenSoft,
  },
  closed: {
    backgroundColor: colors.redSoft,
  },
  openText: {
    fontSize: 11,
    fontWeight: "700",
  },
  openTextOn: {
    color: "#059669",
  },
  closedText: {
    color: colors.red,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingStars: {
    color: colors.amber,
    fontSize: 12,
  },
  ratingText: {
    color: colors.amber,
    fontSize: 12,
    fontWeight: "700",
  },
  mutedText: {
    color: colors.faint,
    fontSize: 12,
  },
  address: {
    color: colors.muted,
    fontSize: 12,
  },
  restaurantFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  distancePill: {
    backgroundColor: colors.orangeSoft,
    borderRadius: 9,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  distanceText: {
    color: colors.orange,
    fontSize: 11,
    fontWeight: "700",
  },
  mapsText: {
    color: colors.blue,
    fontSize: 12,
    fontWeight: "700",
  },
  googleButton: {
    backgroundColor: colors.blue,
    borderRadius: spacing.radiusXl,
    paddingVertical: 15,
    alignItems: "center",
  },
  googleButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "800",
  },
});
