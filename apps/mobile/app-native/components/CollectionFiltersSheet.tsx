import { useCallback, type ReactNode } from "react";
import {
  KeyboardAvoidingView,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type {
  CollectionDateRange,
  CollectionFilters,
  CollectionSortKey,
} from "../collections-utils";
import { FilterChip, filterChipStyles } from "./FilterChip";
import { colors, sharedStyles, shadow, spacing } from "../theme";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export type FilterSheetSection = "rating" | "distance" | "price" | "saved" | "sort";

interface CollectionFiltersSheetProps {
  visible: boolean;
  draft: CollectionFilters;
  expandedSection: FilterSheetSection;
  onClose: () => void;
  onReset: () => void;
  onApply: () => void;
  onDraftChange: (patch: Partial<CollectionFilters>) => void;
  onExpandedSectionChange: (section: FilterSheetSection) => void;
}

function animateAccordion() {
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
}

function FilterRadioOption({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={styles.radioRow}
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
    >
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected && <View style={styles.radioInner} />}
      </View>
      <Text style={[styles.radioLabel, selected && styles.radioLabelSelected]}>{label}</Text>
    </Pressable>
  );
}

function AccordionSection({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <View style={styles.accordionSection}>
      <Pressable
        style={styles.accordionHeader}
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`${title}, ${expanded ? "expanded" : "collapsed"}`}
      >
        <Text style={styles.accordionTitle}>{title}</Text>
        <Text style={styles.accordionChevron}>{expanded ? "▾" : "▸"}</Text>
      </Pressable>
      {expanded && <View style={styles.accordionBody}>{children}</View>}
    </View>
  );
}

function ChipTouchWrap({ children }: { children: ReactNode }) {
  return <View style={styles.chipTouchWrap}>{children}</View>;
}

function formatVndInput(value: number | null) {
  if (value == null || Number.isNaN(value)) return "";
  return String(Math.max(0, Math.round(value)));
}

function parseVndInput(value: string): number | null {
  const digits = value.replaceAll(/[^\d]/g, "");
  if (!digits) return null;
  const parsed = Number(digits);
  if (!Number.isFinite(parsed)) return null;
  return Math.max(0, parsed);
}

function formatVndHint(value: number | null) {
  if (value == null) return "Không giới hạn";
  return `${value.toLocaleString("vi-VN")} ₫`;
}

export function CollectionFiltersSheet({
  visible,
  draft,
  expandedSection,
  onClose,
  onReset,
  onApply,
  onDraftChange,
  onExpandedSectionChange,
}: CollectionFiltersSheetProps) {
  const insets = useSafeAreaInsets();

  const handleToggle = useCallback(
    (section: FilterSheetSection) => {
      animateAccordion();
      if (expandedSection === section) {
        return;
      }
      onExpandedSectionChange(section);
    },
    [expandedSection, onExpandedSectionChange],
  );

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Đóng bộ lọc"
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Math.max(0, insets.bottom - 4)}
          style={styles.keyboardWrap}
        >
          <View style={styles.panel}>
            <View style={styles.handle} />

            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Bộ lọc</Text>
              <Pressable
                onPress={onReset}
                style={styles.resetButton}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Đặt lại bộ lọc"
              >
                <Text style={styles.resetText}>Đặt lại</Text>
              </Pressable>
            </View>

            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <AccordionSection
                title="Đánh giá"
                expanded={expandedSection === "rating"}
                onToggle={() => handleToggle("rating")}
              >
                <View style={filterChipStyles.chipRow}>
                  <ChipTouchWrap>
                    <FilterChip
                      label="Tất cả"
                      active={draft.minRating === 0}
                      onPress={() => onDraftChange({ minRating: 0 })}
                    />
                  </ChipTouchWrap>
                  <ChipTouchWrap>
                    <FilterChip
                      label="3+"
                      active={draft.minRating === 3}
                      onPress={() => onDraftChange({ minRating: 3 })}
                    />
                  </ChipTouchWrap>
                  <ChipTouchWrap>
                    <FilterChip
                      label="4+"
                      active={draft.minRating === 4}
                      onPress={() => onDraftChange({ minRating: 4 })}
                    />
                  </ChipTouchWrap>
                  <ChipTouchWrap>
                    <FilterChip
                      label="4.5+"
                      active={draft.minRating === 4.5}
                      onPress={() => onDraftChange({ minRating: 4.5 })}
                    />
                  </ChipTouchWrap>
                </View>
              </AccordionSection>

              <AccordionSection
                title="Khoảng cách"
                expanded={expandedSection === "distance"}
                onToggle={() => handleToggle("distance")}
              >
                <View style={filterChipStyles.chipRow}>
                  <ChipTouchWrap>
                    <FilterChip
                      label="Tất cả"
                      active={draft.maxDistanceKm == null}
                      onPress={() => onDraftChange({ maxDistanceKm: null })}
                    />
                  </ChipTouchWrap>
                  <ChipTouchWrap>
                    <FilterChip
                      label="≤1 km"
                      active={draft.maxDistanceKm === 1}
                      onPress={() => onDraftChange({ maxDistanceKm: 1 })}
                    />
                  </ChipTouchWrap>
                  <ChipTouchWrap>
                    <FilterChip
                      label="≤3 km"
                      active={draft.maxDistanceKm === 3}
                      onPress={() => onDraftChange({ maxDistanceKm: 3 })}
                    />
                  </ChipTouchWrap>
                  <ChipTouchWrap>
                    <FilterChip
                      label="≤5 km"
                      active={draft.maxDistanceKm === 5}
                      onPress={() => onDraftChange({ maxDistanceKm: 5 })}
                    />
                  </ChipTouchWrap>
                </View>
              </AccordionSection>

              <AccordionSection
                title="Giá"
                expanded={expandedSection === "price"}
                onToggle={() => handleToggle("price")}
              >
                <View style={styles.priceInputRow}>
                  <View style={styles.priceInputWrap}>
                    <Text style={styles.priceLabel}>Giá tối thiểu (VND)</Text>
                    <TextInput
                      value={formatVndInput(draft.minPriceVnd)}
                      onChangeText={(text) => onDraftChange({ minPriceVnd: parseVndInput(text) })}
                      placeholder="0"
                      placeholderTextColor={colors.faint}
                      keyboardType="number-pad"
                      style={styles.priceInput}
                      accessibilityLabel="Nhập giá tối thiểu"
                    />
                    <Text style={styles.priceHint}>{formatVndHint(draft.minPriceVnd)}</Text>
                  </View>
                  <View style={styles.priceInputWrap}>
                    <Text style={styles.priceLabel}>Giá tối đa (VND)</Text>
                    <TextInput
                      value={formatVndInput(draft.maxPriceVnd)}
                      onChangeText={(text) => onDraftChange({ maxPriceVnd: parseVndInput(text) })}
                      placeholder="Không giới hạn"
                      placeholderTextColor={colors.faint}
                      keyboardType="number-pad"
                      style={styles.priceInput}
                      accessibilityLabel="Nhập giá tối đa"
                    />
                    <Text style={styles.priceHint}>{formatVndHint(draft.maxPriceVnd)}</Text>
                  </View>
                </View>
                <Text style={styles.priceNote}>Để trống để không giới hạn mức giá.</Text>
              </AccordionSection>

              <AccordionSection
                title="Ngày lưu"
                expanded={expandedSection === "saved"}
                onToggle={() => handleToggle("saved")}
              >
                <View style={filterChipStyles.chipRow}>
                  {(
                    [
                      ["all", "Tất cả"],
                      ["today", "Hôm nay"],
                      ["7d", "7 ngày"],
                      ["30d", "30 ngày"],
                    ] as const
                  ).map(([value, label]) => (
                    <ChipTouchWrap key={value}>
                      <FilterChip
                        label={label}
                        active={draft.dateRange === value}
                        onPress={() => onDraftChange({ dateRange: value as CollectionDateRange })}
                      />
                    </ChipTouchWrap>
                  ))}
                </View>
              </AccordionSection>

              <AccordionSection
                title="Sắp xếp theo"
                expanded={expandedSection === "sort"}
                onToggle={() => handleToggle("sort")}
              >
                <View style={styles.radioGroup}>
                  {(
                    [
                      ["newest", "Mới nhất"],
                      ["rating", "Đánh giá"],
                      ["distance", "Khoảng cách"],
                    ] as const
                  ).map(([value, label]) => (
                    <FilterRadioOption
                      key={value}
                      label={label}
                      selected={draft.sort === value}
                      onPress={() => onDraftChange({ sort: value as CollectionSortKey })}
                    />
                  ))}
                </View>
              </AccordionSection>
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: Math.max(12, insets.bottom) }]}>
              <Pressable
                style={styles.applyButton}
                onPress={onApply}
                accessibilityRole="button"
                accessibilityLabel="Áp dụng bộ lọc"
              >
                <Text style={sharedStyles.primaryButtonText}>Áp dụng bộ lọc</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  keyboardWrap: {
    justifyContent: "flex-end",
  },
  panel: {
    maxHeight: "85%",
    backgroundColor: colors.white,
    borderTopLeftRadius: spacing.radius2xl,
    borderTopRightRadius: spacing.radius2xl,
    flexDirection: "column",
    ...shadow.card,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#d1d5db",
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.screenX,
    paddingVertical: 8,
    minHeight: 44,
  },
  sheetTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  resetButton: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  resetText: {
    color: colors.orange,
    fontSize: 15,
    fontWeight: "700",
  },
  scroll: {
    flexShrink: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenX,
    paddingBottom: 8,
    gap: 4,
  },
  accordionSection: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  accordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 48,
    paddingVertical: 4,
  },
  accordionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  accordionChevron: {
    color: colors.orange,
    fontSize: 16,
    fontWeight: "800",
    paddingHorizontal: 4,
  },
  accordionBody: {
    paddingBottom: 16,
  },
  priceInputRow: {
    gap: 12,
  },
  priceInputWrap: {
    gap: 6,
  },
  priceLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "600",
  },
  priceHint: {
    color: colors.faint,
    fontSize: 12,
  },
  priceInput: {
    ...sharedStyles.input,
    minHeight: 44,
  },
  priceNote: {
    color: colors.faint,
    fontSize: 12,
    marginTop: 10,
  },
  chipTouchWrap: {
    minHeight: 44,
    justifyContent: "center",
  },
  radioGroup: {
    gap: 2,
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 44,
    paddingVertical: 4,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: {
    borderColor: colors.orange,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.orange,
  },
  radioLabel: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: "600",
  },
  radioLabelSelected: {
    color: colors.orange,
    fontWeight: "700",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingHorizontal: spacing.screenX,
    paddingTop: 12,
  },
  applyButton: {
    ...sharedStyles.primaryButton,
    minHeight: 48,
    justifyContent: "center",
  },
});
