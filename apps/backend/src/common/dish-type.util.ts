import { DishType } from "@prisma/client";

export const dishTypeToApiValue = (dishType: DishType) => dishType.replaceAll("_", " ");

const dishAliases: Record<DishType, string[]> = {
  banh_beo: ["banh beo", "bánh bèo"],
  banh_canh: ["banh canh", "bánh canh"],
  banh_cuon: ["banh cuon", "bánh cuốn"],
  banh_mi: ["banh mi", "bánh mì"],
  banh_xeo: ["banh xeo", "bánh xèo"],
  bun_bo: ["bun bo", "bún bò"],
  bun_bo_hue: ["bun bo hue", "bún bò huế"],
  bun_cha: ["bun cha", "bún chả"],
  bun_dau: ["bun dau", "bun dau mam tom", "bún đậu", "bún đậu mắm tôm"],
  bun_rieu: ["bun rieu", "bun rieu cua", "bún riêu", "bún riêu cua"],
  com_ga: ["com ga", "cơm gà"],
  com_tam: ["com tam", "cơm tấm"],
  goi_cuon: ["goi cuon", "gỏi cuốn"],
  hu_tieu: ["hu tieu", "hủ tiếu"],
  mi_quang: ["mi quang", "mì quảng"],
  pho: ["pho", "phở"],
};

const normalizeDishInput = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replaceAll("đ", "d")
    .replaceAll("_", " ")
    .replaceAll(/[^a-z0-9\s]/g, " ")
    .trim()
    .replaceAll(/\s+/g, " ");

const aliasToDishType = Object.entries(dishAliases).reduce<Record<string, DishType>>((acc, [dishType, aliases]) => {
  for (const alias of aliases) {
    acc[normalizeDishInput(alias)] = dishType as DishType;
  }
  acc[normalizeDishInput(dishType)] = dishType as DishType;
  return acc;
}, {});

export const dishTypeFromApiValue = (value: string): DishType | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }
  const normalized = normalizeDishInput(value);
  return aliasToDishType[normalized];
};

const matcherList: Array<{ aliasNormalized: string; dishType: DishType }> = (() => {
  const items: Array<{ aliasNormalized: string; dishType: DishType }> = [];
  for (const [dishType, aliases] of Object.entries(dishAliases) as [DishType, string[]][]) {
    for (const alias of [...aliases, dishType]) {
      const normalized = normalizeDishInput(alias);
      if (normalized) {
        items.push({ aliasNormalized: normalized, dishType });
      }
    }
  }
  return items.sort((a, b) => b.aliasNormalized.length - a.aliasNormalized.length);
})();

export function detectDishTypesInText(...inputs: Array<string | null | undefined>): DishType[] {
  const combined = inputs
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .map((value) => normalizeDishInput(value))
    .join(" ");

  if (!combined) {
    return [];
  }
  const haystack = ` ${combined} `;
  const found = new Set<DishType>();
  for (const { aliasNormalized, dishType } of matcherList) {
    if (haystack.includes(` ${aliasNormalized} `)) {
      found.add(dishType);
    }
  }
  return Array.from(found);
}
