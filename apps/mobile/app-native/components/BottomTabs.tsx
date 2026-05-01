import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, shadow, spacing } from "../theme";
import type { ScreenName } from "../types";

const tabs: Array<{ screen: ScreenName; label: string; icon: string }> = [
  { screen: "swipe", label: "Swipe", icon: "⌂" },
  { screen: "map", label: "Map", icon: "⌖" },
  { screen: "collections", label: "Saved", icon: "♡" },
  { screen: "filters", label: "Profile", icon: "☷" },
];

interface BottomTabsProps {
  active: ScreenName;
  onChange: (screen: ScreenName) => void;
}

export function BottomTabs({ active, onChange }: BottomTabsProps) {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 8);
  return (
    <View style={[styles.wrap, { height: spacing.navHeight + bottomInset, paddingBottom: bottomInset }]}>
      {tabs.map((tab) => {
        const isActive = active === tab.screen;
        return (
          <Pressable
            key={tab.screen}
            onPress={() => onChange(tab.screen)}
            style={[styles.tab, isActive && styles.activeTab]}
          >
            <Text style={[styles.icon, isActive && styles.activeText]}>{tab.icon}</Text>
            <Text style={[styles.label, isActive && styles.activeText]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 8,
    ...shadow.soft,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 14,
    gap: 2,
  },
  activeTab: {
    backgroundColor: colors.orangeSoft,
  },
  icon: {
    color: colors.faint,
    fontSize: 19,
    lineHeight: 22,
  },
  label: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "600",
  },
  activeText: {
    color: colors.orange,
  },
});
