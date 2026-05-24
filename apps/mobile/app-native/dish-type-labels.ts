const DISH_TYPE_LABELS: Record<string, string> = {
  "bun bo": "Bún bò",
  "bun dau": "Bún đậu",
  "com ga": "Cơm gà",
  "com tam": "Cơm tấm",
  pho: "Phở",
  "banh mi": "Bánh mì",
  "bun cha": "Bún chả",
  "hu tieu": "Hủ tiếu",
  "banh xeo": "Bánh xèo",
  "goi cuon": "Gỏi cuốn",
  "mi quang": "Mì Quảng",
  "bun rieu": "Bún riêu",
  "bun bo hue": "Bún bò Huế",
  "banh cuon": "Bánh cuốn",
  "banh canh": "Bánh canh",
  "banh beo": "Bánh bèo",
};

function normalizeDishKey(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replaceAll(/[\u0300-\u036f]/g, "")
    .replaceAll("đ", "d")
    .replaceAll("_", " ")
    .trim()
    .replaceAll(/\s+/g, " ");
}

function toTitleCase(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatDishTypeLabel(value: string | null | undefined) {
  if (!value) return "Khác";
  const normalized = normalizeDishKey(value);
  const mapped = DISH_TYPE_LABELS[normalized];
  if (mapped) return mapped;
  return toTitleCase(value.replaceAll("_", " ").trim());
}
