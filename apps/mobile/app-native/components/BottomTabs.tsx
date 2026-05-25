import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, shadow, spacing } from "../theme";
import type { ScreenName } from "../types";
import { Ionicons } from '@expo/vector-icons'; 

// 1. Định nghĩa bộ icon mới: Đậm hơn và phù hợp với vibe "Tinner"
const tabs: Array<{ screen: ScreenName; label: string; icon: any; activeIcon: any }> = [
  { screen: "swipe", label: "Swipe", icon: "flame-outline", activeIcon: "flame" }, // Dùng icon ngọn lửa cho vibe "hot/trending"
  { screen: "map", label: "Map", icon: "location-outline", activeIcon: "location" },
  { screen: "collections", label: "Saved", icon: "heart-outline", activeIcon: "heart" },
  { screen: "filters", label: "Profile", icon: "person-outline", activeIcon: "person" },
];

// 2. Cố định kích thước icon lớn
const ICON_SIZE = 32; 

interface BottomTabsProps {
  active: ScreenName;
  onChange: (screen: ScreenName) => void;
}

export function BottomTabs({ active, onChange }: BottomTabsProps) {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 10);

  return (
    <View style={[styles.wrap, { height: 85 + insets.bottom, paddingBottom: bottomInset }]}>
      {tabs.map((tab) => {
        const isActive = active === tab.screen;
        return (
          <Pressable
            key={tab.screen}
            onPress={() => onChange(tab.screen)}
            style={({ pressed }) => [
              styles.tab,
              pressed && { opacity: 0.8, transform: [{ scale: 0.92 }] } 
            ]}
          >
            {/* Vùng chứa Icon cố định để đảm bảo căn lề luôn chuẩn */}
            <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
              <Ionicons 
                name={isActive ? tab.activeIcon : tab.icon} 
                size={ICON_SIZE} 
                color={isActive ? colors.orange : colors.faint} 
              />
            </View>
            
            <Text style={[styles.label, isActive && styles.activeText]}>
              {tab.label}
            </Text>
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
    borderTopColor: "#f0f0f0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 10,
    // Đổ bóng đậm hơn một chút để tạo độ nổi khối
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    marginBottom: 4,
  },
  activeIconContainer: {
    // Hiệu ứng nền nhẹ khi được chọn để icon "to" càng thêm nổi bật
    backgroundColor: colors.orangeSoft,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.muted,
    marginTop: 2,
  },
  activeText: {
    color: colors.orange,
  },
});