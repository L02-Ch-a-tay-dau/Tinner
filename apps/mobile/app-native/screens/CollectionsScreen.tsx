import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  applyCollectionFilters,
  countSectionItems,
  DEFAULT_COLLECTION_FILTERS,
  flattenSectionsForList,
  getActiveCollectionFilterChips,
  getInitialExpandedSection,
  groupCollectionByCuisine,
  hasSheetFiltersActive,
  paginateSections,
  sortCollectionItems,
  toCollectionViewModel,
  type CollectionFilters,
  type CollectionItemViewModel,
} from "../collections-utils";
import {
  CollectionFiltersSheet,
  type FilterSheetSection,
} from "../components/CollectionFiltersSheet";
import { RestaurantPanel } from "../components/RestaurantPanel";
import { colors, sharedStyles, shadow, spacing } from "../theme";
import type { LikedFood, NativeFood } from "../types";

const PAGE_SIZE = 25;

interface CollectionsScreenProps {
  likedFoods: LikedFood[];
  selectedFood: NativeFood | null;
  onStartSwiping: () => void;
  onRemove: (foodId: string) => void;
  onClearAll: () => void;
  onSelectFood: (foodId: string) => void;
  onClosePanel: () => void;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type ListRow =
  | { type: "header"; key: string; title: string; count: number; expanded: boolean }
  | { type: "item"; key: string; item: CollectionItemViewModel };

export function CollectionsScreen({
  likedFoods,
  selectedFood,
  onStartSwiping,
  onRemove,
  onClearAll,
  onSelectFood,
  onClosePanel,
}: CollectionsScreenProps) {
  const insets = useSafeAreaInsets();
  const [filters, setFilters] = useState<CollectionFilters>(DEFAULT_COLLECTION_FILTERS);
  const [draftFilters, setDraftFilters] = useState<CollectionFilters>(DEFAULT_COLLECTION_FILTERS);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [expandedSection, setExpandedSection] = useState<FilterSheetSection>("rating");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [expandedCuisines, setExpandedCuisines] = useState<Set<string>>(() => new Set());

  const viewModels = useMemo(
    () => likedFoods.map(toCollectionViewModel),
    [likedFoods],
  );

  const filteredSorted = useMemo(() => {
    const filtered = applyCollectionFilters(viewModels, filters);
    return sortCollectionItems(filtered, filters.sort);
  }, [viewModels, filters]);

  const allSections = useMemo(
    () => groupCollectionByCuisine(filteredSorted),
    [filteredSorted],
  );

  const totalFilteredCount = filteredSorted.length;
  const visibleSections = useMemo(
    () => paginateSections(allSections, visibleCount),
    [allSections, visibleCount],
  );
  const visibleRows = useMemo(
    () => flattenSectionsForList(visibleSections, expandedCuisines),
    [visibleSections, expandedCuisines],
  );

  const toggleCuisine = useCallback((title: string) => {
    setExpandedCuisines((prev) => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  }, []);
  const visibleItemCount = countSectionItems(visibleSections);
  const hasMore = visibleItemCount < totalFilteredCount;

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filters, likedFoods.length]);

  const loadMore = useCallback(() => {
    if (!hasMore) return;
    setVisibleCount((prev) => prev + PAGE_SIZE);
  }, [hasMore]);

  const updateFilters = useCallback((patch: Partial<CollectionFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_COLLECTION_FILTERS);
  }, []);

  const activeFilterChips = useMemo(
    () => getActiveCollectionFilterChips(filters),
    [filters],
  );

  const openFiltersSheet = useCallback(() => {
    setDraftFilters(filters);
    setExpandedSection(getInitialExpandedSection(filters));
    setSheetVisible(true);
  }, [filters]);

  const closeFiltersSheet = useCallback(() => {
    setSheetVisible(false);
  }, []);

  const applyDraftFilters = useCallback(() => {
    let { minPriceVnd, maxPriceVnd } = draftFilters;
    if (minPriceVnd != null && maxPriceVnd != null && minPriceVnd > maxPriceVnd) {
      [minPriceVnd, maxPriceVnd] = [maxPriceVnd, minPriceVnd];
    }
    setFilters({
      ...draftFilters,
      minPriceVnd,
      maxPriceVnd,
    });
    setSheetVisible(false);
  }, [draftFilters]);

  const updateDraftFilters = useCallback((patch: Partial<CollectionFilters>) => {
    setDraftFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const removeFilterChip = useCallback((patch: Partial<CollectionFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const confirmClear = () => {
    Alert.alert("Xóa toàn bộ món đã lưu?", "Thao tác này sẽ xóa tất cả món bạn đã lưu.", [
      { text: "Hủy", style: "cancel" },
      { text: "Xóa tất cả", style: "destructive", onPress: onClearAll },
    ]);
  };

  const renderItem = useCallback(
    ({ item: row }: { item: ListRow }) => {
      if (row.type === "header") {
        return (
          <Pressable style={styles.sectionHeader} onPress={() => toggleCuisine(row.title)}>
            <Text style={styles.groupTitle}>
              <Text style={styles.groupDot}>● </Text>
              {row.title}{" "}
              <Text style={styles.groupCount}>({row.count})</Text>
            </Text>
            <Text style={styles.chevron}>{row.expanded ? "▾" : "▸"}</Text>
          </Pressable>
        );
      }

      const { food, rating, distanceNum } = row.item;
      return (
        <Pressable
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
              {rating != null && rating > 0 && (
                <Text style={styles.metaBadge}>★ {rating.toFixed(1)}</Text>
              )}
              {distanceNum != null && (
                <Text style={styles.metaBadge}>{distanceNum.toFixed(1)} km</Text>
              )}
            </View>
            <Text style={styles.dateText}>▣ {formatDate(food.likedAt)}</Text>
          </View>
          <Pressable
            style={styles.deleteButton}
            onPress={() => onRemove(food.foodId)}
            hitSlop={8}
          >
            <Text style={styles.deleteText}>✕</Text>
          </Pressable>
        </Pressable>
      );
    },
    [onRemove, onSelectFood, toggleCuisine],
  );

  const listHeader = (
    <View style={styles.filtersPanel}>
      <TextInput
        value={filters.query}
        onChangeText={(query) => updateFilters({ query })}
        placeholder="Tìm theo tên món, loại món, tag..."
        placeholderTextColor={colors.faint}
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.searchInput}
      />

      <Pressable
        style={styles.filtersButton}
        onPress={openFiltersSheet}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Mở bộ lọc"
      >
        <Text style={styles.filtersButtonText}>Bộ lọc</Text>
        {hasSheetFiltersActive(filters) && <View style={styles.filtersBadge} />}
      </Pressable>

      {activeFilterChips.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.activeChipsRow}
        >
          {activeFilterChips.map((chip) => (
            <Pressable
              key={chip.id}
              style={styles.activeChip}
              onPress={() => removeFilterChip(chip.patch)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Gỡ bộ lọc ${chip.label}`}
            >
              <Text style={styles.activeChipText}>{chip.label}</Text>
              <Text style={styles.activeChipDismiss}>×</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      <Text style={styles.summaryText}>
        Hiển thị {visibleItemCount}/{totalFilteredCount}
        {totalFilteredCount !== likedFoods.length ? ` (${likedFoods.length} món)` : ""}
      </Text>
    </View>
  );

  return (
    <View
      style={[
        sharedStyles.screen,
        { paddingBottom: spacing.navHeight + Math.max(12, insets.bottom + 8) },
      ]}
    >
      <View style={styles.header}>
        <View>
          <Text style={sharedStyles.headerTitle}>Món đã lưu</Text>
          <Text style={sharedStyles.headerSubtitle}>
            {likedFoods.length} món
          </Text>
        </View>
        {likedFoods.length > 0 && (
          <Pressable onPress={confirmClear}>
            <Text style={styles.clearText}>Xóa tất cả</Text>
          </Pressable>
        )}
      </View>

      {likedFoods.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyCircle}>
            <Text style={styles.emptyIcon}>♡</Text>
          </View>
          <Text style={styles.emptyTitle}>Bạn chưa lưu món nào</Text>
          <Text style={styles.emptyText}>
            Hãy vuốt và lưu những món bạn thích để xem lại tại đây.
          </Text>
          <Pressable style={styles.startButton} onPress={onStartSwiping}>
            <Text style={styles.startButtonText}>Bắt đầu vuốt</Text>
          </Pressable>
        </View>
      ) : totalFilteredCount === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Không có kết quả phù hợp</Text>
          <Text style={styles.emptyText}>
            Hãy điều chỉnh từ khóa hoặc bộ lọc để tìm món đã lưu.
          </Text>
          <Pressable style={styles.startButton} onPress={clearFilters}>
            <Text style={styles.startButtonText}>Xóa bộ lọc</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={visibleRows}
          keyExtractor={(row) => row.key}
          renderItem={renderItem}
          ListHeaderComponent={listHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onEndReached={loadMore}
          onEndReachedThreshold={0.35}
          ListFooterComponent={
            hasMore ? (
              <View style={styles.footer}>
                <Text style={styles.footerText}>Cuộn để xem thêm...</Text>
              </View>
            ) : null
          }
        />
      )}

      <CollectionFiltersSheet
        visible={sheetVisible}
        draft={draftFilters}
        expandedSection={expandedSection}
        onClose={closeFiltersSheet}
        onReset={() => setDraftFilters(DEFAULT_COLLECTION_FILTERS)}
        onApply={applyDraftFilters}
        onDraftChange={updateDraftFilters}
        onExpandedSectionChange={setExpandedSection}
      />

      <RestaurantPanel food={selectedFood} onClose={onClosePanel} />
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
  listContent: {
    paddingBottom: 26,
    gap: 12,
  },
  filtersPanel: {
    gap: 10,
    marginBottom: 10,
  },
  searchInput: {
    ...sharedStyles.input,
  },
  filtersButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 8,
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  filtersButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  filtersBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.orange,
  },
  activeChipsRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  activeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.orangeSoft,
    borderWidth: 1,
    borderColor: colors.orange,
  },
  activeChipText: {
    color: colors.orange,
    fontSize: 12,
    fontWeight: "700",
  },
  activeChipDismiss: {
    color: colors.orange,
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 18,
  },
  summaryText: {
    color: colors.faint,
    fontSize: 12,
    marginTop: 2,
  },
  sectionHeader: {
    marginTop: 6,
    marginBottom: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chevron: {
    color: colors.orange,
    fontSize: 16,
    fontWeight: "800",
    paddingHorizontal: 8,
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
    flexWrap: "wrap",
    gap: 6,
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
  metaBadge: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
  },
  dateText: {
    color: colors.faint,
    fontSize: 11,
    marginTop: 6,
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
  footer: {
    paddingVertical: 16,
    alignItems: "center",
  },
  footerText: {
    color: colors.faint,
    fontSize: 12,
  },
});
