import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Image,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors, shadow } from "../theme";
import type { NativeFood } from "../types";

const SWIPE_THRESHOLD = 110;
const SWIPE_CAPTURE_THRESHOLD = 10;

interface FoodSwipeCardProps {
  food: NativeFood;
  isTop: boolean;
  swipeEnabled?: boolean;
  stackIndex: number;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

export function FoodSwipeCard({
  food,
  isTop,
  swipeEnabled = true,
  stackIndex,
  onSwipeLeft,
  onSwipeRight,
}: Readonly<FoodSwipeCardProps>) {
  const pan = useRef(new Animated.ValueXY()).current;
  const [dragging, setDragging] = useState(false);
  const isInteractive = isTop && swipeEnabled;

  const rotate = pan.x.interpolate({
    inputRange: [-220, 0, 220],
    outputRange: ["-16deg", "0deg", "16deg"],
    extrapolate: "clamp",
  });
  const likeOpacity = pan.x.interpolate({
    inputRange: [20, 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const nopeOpacity = pan.x.interpolate({
    inputRange: [-100, -20],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gesture) =>
          isInteractive &&
          Math.abs(gesture.dx) > SWIPE_CAPTURE_THRESHOLD &&
          Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderGrant: () => setDragging(true),
        onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: (_, gesture) => {
          setDragging(false);
          if (gesture.dx > SWIPE_THRESHOLD) {
            Animated.timing(pan, {
              toValue: { x: 520, y: gesture.dy },
              duration: 220,
              useNativeDriver: true,
            }).start(onSwipeRight);
            return;
          }
          if (gesture.dx < -SWIPE_THRESHOLD) {
            Animated.timing(pan, {
              toValue: { x: -520, y: gesture.dy },
              duration: 220,
              useNativeDriver: true,
            }).start(onSwipeLeft);
            return;
          }
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
            friction: 7,
          }).start();
        },
        onPanResponderTerminate: () => {
          setDragging(false);
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
            friction: 7,
          }).start();
        },
      }),
    [isInteractive, onSwipeLeft, onSwipeRight, pan],
  );

  useEffect(() => {
    pan.setValue({ x: 0, y: 0 });
    setDragging(false);
  }, [food.id, pan]);

  const stackOffset = stackIndex * 8;
  const stackScale = 1 - stackIndex * 0.04;

  return (
    <Animated.View
      pointerEvents={isInteractive ? "auto" : "none"}
      {...(isInteractive ? panResponder.panHandlers : {})}
      style={[
        styles.card,
        {
          zIndex: 10 - stackIndex,
          transform: isTop
            ? [{ translateX: pan.x }, { translateY: pan.y }, { rotate }]
            : [{ translateY: stackOffset }, { scale: stackScale }],
        },
      ]}
    >
      <Image source={{ uri: food.image }} style={styles.image} />
      <View style={styles.scrim} />

      <Animated.View style={[styles.likeBadge, { opacity: likeOpacity }]}>
        <Text style={styles.likeText}>YUM!</Text>
      </Animated.View>
      <Animated.View style={[styles.nopeBadge, { opacity: nopeOpacity }]}>
        <Text style={styles.nopeText}>NOPE</Text>
      </Animated.View>

      <View style={styles.cuisinePill}>
        <Text style={styles.cuisineText}>{food.cuisine}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <View style={styles.titleBlock}>
            <Text style={styles.title} numberOfLines={2}>
              {food.name}
            </Text>
            <Text style={styles.description} numberOfLines={2}>
              {food.description}
            </Text>
          </View>
          <View style={styles.caloriePill}>
            <Text style={styles.calorieText}>
              {food.cardStats ? `${food.cardStats.emoji} ${food.cardStats.text}` : `🔥 ${food.calories}`}
            </Text>
          </View>
        </View>

        <View style={styles.tags}>
          {food.tags.slice(0, 3).map((tag, index) => (
            <View key={`${tag}-${index}`} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        {isTop && !dragging && (
          <View style={styles.hintRow}>
            <Pressable onPress={onSwipeLeft}>
              <Text style={styles.hintText}>✕ swipe left to skip</Text>
            </Pressable>
            <View style={styles.hintDivider} />
            <Pressable onPress={onSwipeRight}>
              <Text style={styles.hintText}>swipe right to find ♥</Text>
            </Pressable>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    inset: 0,
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: colors.white,
    ...shadow.card,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  scrim: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.28)",
  },
  likeBadge: {
    position: "absolute",
    top: 54,
    left: 24,
    borderWidth: 4,
    borderColor: "#34d399",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 6,
    transform: [{ rotate: "-18deg" }],
  },
  likeText: {
    color: "#34d399",
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 1,
  },
  nopeBadge: {
    position: "absolute",
    top: 54,
    right: 24,
    borderWidth: 4,
    borderColor: "#f87171",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 6,
    transform: [{ rotate: "18deg" }],
  },
  nopeText: {
    color: "#f87171",
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 1,
  },
  cuisinePill: {
    position: "absolute",
    top: 20,
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.22)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.32)",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  cuisineText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "600",
  },
  content: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    paddingTop: 80,
    backgroundColor: "rgba(0,0,0,0.48)",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    color: colors.white,
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "800",
  },
  description: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 14,
    lineHeight: 19,
    marginTop: 6,
  },
  caloriePill: {
    backgroundColor: "rgba(249,115,22,0.92)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  calorieText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "700",
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  tag: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  hintRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  hintText: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 12,
    fontWeight: "600",
  },
  hintDivider: {
    width: 1,
    height: 14,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
});
