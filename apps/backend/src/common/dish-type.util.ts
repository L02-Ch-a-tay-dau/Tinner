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

export const dishTypeFromApiValue = (value: string): DishType | string => {
  if (typeof value !== "string") {
    return value;
  }
  const normalized = normalizeDishInput(value);
  return aliasToDishType[normalized] ?? value.replaceAll(" ", "_");
};
