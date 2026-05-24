export const CUISINE_CATEGORIES = [
  "Quán vỉa hè",
  "Cơm & Mì",
  "Hải sản",
  "Lẩu & Nướng",
  "Đồ ăn Nhật Bản",
  "Đồ ăn Hàn Quốc",
  "Đồ ăn Trung Hoa",
  "Đồ ăn Âu",
  "Cafe",
  "Trà sữa",
  "Bánh mì",
  "Gà rán",
  "Pizza",
  "Phở",
  "Bún",
  "Bánh xèo",
  "Bánh cuốn",
  "Bánh canh",
  "Bánh bèo",
  "Chay",
  "Khác",
] as const;

export type CuisineCategory = (typeof CUISINE_CATEGORIES)[number];

const cuisineTagToCategory: Record<string, CuisineCategory> = {
  vietnamese: "Quán vỉa hè",
  street_food: "Quán vỉa hè",
  regional: "Quán vỉa hè",
  pho: "Phở",
  pho_bo: "Phở",
  noodle: "Cơm & Mì",
  banh_mi: "Bánh mì",
  bun_bo: "Bún",
  bun_cha: "Bún",
  bun_dau: "Bún",
  bun_rieu: "Bún",
  bun_bo_hue: "Bún",
  banh_xeo: "Bánh xèo",
  goi_cuon: "Quán vỉa hè",
  banh_cuon: "Bánh cuốn",
  banh_canh: "Bánh canh",
  banh_beo: "Bánh bèo",
  soup: "Cơm & Mì",
  rice: "Cơm & Mì",
  curry: "Cơm & Mì",
  com_tam: "Cơm & Mì",
  com_ga: "Cơm & Mì",
  hu_tieu: "Cơm & Mì",
  mi_quang: "Cơm & Mì",
  seafood: "Hải sản",
  fish: "Hải sản",
  hotpot: "Lẩu & Nướng",
  bbq: "Lẩu & Nướng",
  grill: "Lẩu & Nướng",
  "hot_pot": "Lẩu & Nướng",
  japanese: "Đồ ăn Nhật Bản",
  japanese_food: "Đồ ăn Nhật Bản",
  japanese_cuisine: "Đồ ăn Nhật Bản",
  sushi: "Đồ ăn Nhật Bản",
  ramen: "Đồ ăn Nhật Bản",
  japanese_ramen: "Đồ ăn Nhật Bản",
  okonomiyaki: "Đồ ăn Nhật Bản",
  izakaya: "Đồ ăn Nhật Bản",
  korean: "Đồ ăn Hàn Quốc",
  korean_food: "Đồ ăn Hàn Quốc",
  korean_cuisine: "Đồ ăn Hàn Quốc",
  korean_barbecue: "Đồ ăn Hàn Quốc",
  bibimbap: "Đồ ăn Hàn Quốc",
  chinese: "Đồ ăn Trung Hoa",
  chinese_food: "Đồ ăn Trung Hoa",
  chinese_cuisine: "Đồ ăn Trung Hoa",
  cantonese: "Đồ ăn Trung Hoa",
  dim_sum: "Đồ ăn Trung Hoa",
  italian: "Đồ ăn Âu",
  french: "Đồ ăn Âu",
  burger: "Đồ ăn Âu",
  american: "Đồ ăn Âu",
  mexican: "Đồ ăn Âu",
  indian: "Đồ ăn Âu",
  thai: "Đồ ăn Âu",
  mediterranean: "Đồ ăn Âu",
  western: "Đồ ăn Âu",
  pizza: "Pizza",
  coffee_shop: "Cafe",
  coffee: "Cafe",
  cafe: "Cafe",
  tea: "Cafe",
  bubble_tea: "Trà sữa",
  bakery: "Bánh mì",
  sandwich: "Bánh mì",
  fast_food: "Gà rán",
  fried_chicken: "Gà rán",
  vegetarian: "Chay",
  vegan: "Chay",
};

function normalizeCuisineToken(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replaceAll(/[\s-]+/g, "_")
    .replaceAll(/[^a-z0-9_]/g, "")
    .replaceAll(/_+/g, "_")
    .replaceAll(/^_+|_+$/g, "");
}

export function categorizeCuisine(cuisineTag: string | null): CuisineCategory {
  if (!cuisineTag) return "Khác";

  const normalized = normalizeCuisineToken(cuisineTag);

  if (cuisineTagToCategory[normalized]) {
    return cuisineTagToCategory[normalized];
  }

  const tokens = cuisineTag.split(/[;,|]/).map(normalizeCuisineToken);
  for (const token of tokens) {
    if (cuisineTagToCategory[token]) {
      return cuisineTagToCategory[token];
    }
  }

  return "Khác";
}
