import type { LikedFood } from "./types";
import { formatDishTypeLabel } from "./dish-type-labels";

export type CollectionSortKey = "newest" | "rating" | "distance";
export type CollectionDateRange = "all" | "today" | "7d" | "30d";

export interface CollectionFilters {
  query: string;
  minRating: number;
  maxDistanceKm: number | null;
  minPriceVnd: number | null;
  maxPriceVnd: number | null;
  dateRange: CollectionDateRange;
  sort: CollectionSortKey;
}

export const DEFAULT_COLLECTION_FILTERS: CollectionFilters = {
  query: "",
  minRating: 0,
  maxDistanceKm: null,
  minPriceVnd: null,
  maxPriceVnd: null,
  dateRange: "all",
  sort: "newest",
};

export interface CollectionItemViewModel {
  food: LikedFood;
  foodId: string;
  cuisine: string;
  savedAtMs: number;
  rating: number | null;
  distanceNum: number | null;
  priceVnd: number | null;
  searchText: string;
}

export interface CollectionSection {
  title: string;
  data: CollectionItemViewModel[];
}

function normalizeSearchText(food: LikedFood): string {
  const tags = (food.tags ?? []).join(" ");
  return `${food.foodName} ${food.cuisine} ${food.dishType ?? ""} ${tags}`.toLowerCase();
}

function toPriceVnd(price: string | null | undefined): number | null {
  if (!price) return null;
  const level = price.trim();
  if (level === "$") return 50_000;
  if (level === "$$") return 150_000;
  if (level === "$$$") return 300_000;
  if (level === "$$$$") return 600_000;
  return null;
}

export function toCollectionViewModel(food: LikedFood): CollectionItemViewModel {
  const restaurant = food.restaurants?.[0];
  return {
    food,
    foodId: food.foodId,
    cuisine: formatDishTypeLabel(food.cuisine || food.dishType),
    savedAtMs: new Date(food.likedAt).getTime() || 0,
    rating: restaurant?.rating != null && restaurant.rating > 0 ? restaurant.rating : null,
    distanceNum: restaurant?.distanceNum != null ? restaurant.distanceNum : null,
    priceVnd: toPriceVnd(restaurant?.price),
    searchText: normalizeSearchText(food),
  };
}

function matchesDateRange(savedAtMs: number, range: CollectionDateRange): boolean {
  if (range === "all") {
    return true;
  }
  if (savedAtMs <= 0) {
    return false;
  }
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  if (range === "today") {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    return savedAtMs >= startOfToday.getTime();
  }
  if (range === "7d") {
    return now - savedAtMs <= 7 * dayMs;
  }
  if (range === "30d") {
    return now - savedAtMs <= 30 * dayMs;
  }
  return true;
}

export function applyCollectionFilters(
  items: CollectionItemViewModel[],
  filters: CollectionFilters,
): CollectionItemViewModel[] {
  const query = filters.query.trim().toLowerCase();

  return items.filter((item) => {
    if (query && !item.searchText.includes(query)) {
      return false;
    }
    if (filters.minRating > 0) {
      if (item.rating == null || item.rating < filters.minRating) {
        return false;
      }
    }
    if (filters.maxDistanceKm != null) {
      if (item.distanceNum == null || item.distanceNum > filters.maxDistanceKm) {
        return false;
      }
    }
    if (filters.minPriceVnd != null) {
      if (item.priceVnd == null || item.priceVnd < filters.minPriceVnd) {
        return false;
      }
    }
    if (filters.maxPriceVnd != null) {
      if (item.priceVnd == null || item.priceVnd > filters.maxPriceVnd) {
        return false;
      }
    }
    if (!matchesDateRange(item.savedAtMs, filters.dateRange)) {
      return false;
    }
    return true;
  });
}

export function sortCollectionItems(
  items: CollectionItemViewModel[],
  sort: CollectionSortKey,
): CollectionItemViewModel[] {
  const sorted = [...items];
  if (sort === "newest") {
    sorted.sort((a, b) => b.savedAtMs - a.savedAtMs);
    return sorted;
  }
  if (sort === "rating") {
    sorted.sort((a, b) => {
      const ar = a.rating ?? -1;
      const br = b.rating ?? -1;
      if (br !== ar) return br - ar;
      return b.savedAtMs - a.savedAtMs;
    });
    return sorted;
  }
  sorted.sort((a, b) => {
    const ad = a.distanceNum ?? Number.POSITIVE_INFINITY;
    const bd = b.distanceNum ?? Number.POSITIVE_INFINITY;
    if (ad !== bd) return ad - bd;
    return b.savedAtMs - a.savedAtMs;
  });
  return sorted;
}

export function groupCollectionByCuisine(items: CollectionItemViewModel[]): CollectionSection[] {
  const map = new Map<string, CollectionItemViewModel[]>();
  for (const item of items) {
    const list = map.get(item.cuisine) ?? [];
    list.push(item);
    map.set(item.cuisine, list);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b, "vi"))
    .map(([title, data]) => ({ title, data }));
}

export function paginateSections(sections: CollectionSection[], visibleCount: number): CollectionSection[] {
  let remaining = visibleCount;
  const result: CollectionSection[] = [];
  for (const section of sections) {
    if (remaining <= 0) break;
    const slice = section.data.slice(0, remaining);
    if (slice.length > 0) {
      result.push({ title: section.title, data: slice });
      remaining -= slice.length;
    }
  }
  return result;
}

export function countSectionItems(sections: CollectionSection[]): number {
  return sections.reduce((sum, section) => sum + section.data.length, 0);
}

export const COLLECTION_PREVIEW_COUNT = 2;

export function flattenSectionsForList(
  sections: CollectionSection[],
  expandedCuisines: ReadonlySet<string>,
  previewCount = COLLECTION_PREVIEW_COUNT,
): Array<
  | { type: "header"; key: string; title: string; count: number; expanded: boolean }
  | { type: "item"; key: string; item: CollectionItemViewModel }
> {
  const rows: Array<
    | { type: "header"; key: string; title: string; count: number; expanded: boolean }
    | { type: "item"; key: string; item: CollectionItemViewModel }
  > = [];
  for (const section of sections) {
    const expanded = expandedCuisines.has(section.title);
    const visibleItems =
      expanded || section.data.length <= previewCount
        ? section.data
        : section.data.slice(0, previewCount);
    rows.push({
      type: "header",
      key: `header-${section.title}`,
      title: section.title,
      count: section.data.length,
      expanded,
    });
    for (const item of visibleItems) {
      rows.push({ type: "item", key: item.foodId, item });
    }
  }
  return rows;
}

export function hasSheetFiltersActive(filters: CollectionFilters): boolean {
  return (
    filters.minRating > 0 ||
    filters.maxDistanceKm != null ||
    filters.minPriceVnd != null ||
    filters.maxPriceVnd != null ||
    filters.dateRange !== "all" ||
    filters.sort !== "newest"
  );
}

export function hasActiveFilters(filters: CollectionFilters): boolean {
  return filters.query.trim().length > 0 || hasSheetFiltersActive(filters);
}

export interface CollectionFilterChip {
  id: string;
  label: string;
  patch: Partial<CollectionFilters>;
}

function formatCompactVnd(value: number) {
  return `${Math.round(value / 1000).toLocaleString("vi-VN")}k₫`;
}

export function getActiveCollectionFilterChips(filters: CollectionFilters): CollectionFilterChip[] {
  const chips: CollectionFilterChip[] = [];

  if (filters.minRating > 0) {
    chips.push({
      id: "minRating",
      label: `Đánh giá ${filters.minRating}+`,
      patch: { minRating: 0 },
    });
  }

  if (filters.maxDistanceKm != null) {
    chips.push({
      id: "maxDistanceKm",
      label: `≤${filters.maxDistanceKm} km`,
      patch: { maxDistanceKm: null },
    });
  }

  if (filters.minPriceVnd != null || filters.maxPriceVnd != null) {
    const minPart =
      filters.minPriceVnd != null
        ? formatCompactVnd(filters.minPriceVnd)
        : "0";
    const maxPart =
      filters.maxPriceVnd != null
        ? formatCompactVnd(filters.maxPriceVnd)
        : "∞";
    chips.push({
      id: "priceRange",
      label: `Giá ${minPart} - ${maxPart}`,
      patch: { minPriceVnd: null, maxPriceVnd: null },
    });
  }

  if (filters.dateRange !== "all") {
    const dateLabels: Record<CollectionDateRange, string> = {
      all: "Tất cả",
      today: "Hôm nay",
      "7d": "7 ngày",
      "30d": "30 ngày",
    };
    chips.push({
      id: "dateRange",
      label: dateLabels[filters.dateRange],
      patch: { dateRange: "all" },
    });
  }

  if (filters.sort !== "newest") {
    const sortLabels: Record<CollectionSortKey, string> = {
      newest: "Mới nhất",
      rating: "Sắp xếp: Đánh giá",
      distance: "Sắp xếp: Khoảng cách",
    };
    chips.push({
      id: "sort",
      label: sortLabels[filters.sort],
      patch: { sort: "newest" },
    });
  }

  return chips;
}

export function getInitialExpandedSection(
  filters: CollectionFilters,
): "rating" | "distance" | "price" | "saved" | "sort" {
  if (filters.minRating > 0) return "rating";
  if (filters.maxDistanceKm != null) return "distance";
  if (filters.minPriceVnd != null || filters.maxPriceVnd != null) return "price";
  if (filters.dateRange !== "all") return "saved";
  if (filters.sort !== "newest") return "sort";
  return "rating";
}
