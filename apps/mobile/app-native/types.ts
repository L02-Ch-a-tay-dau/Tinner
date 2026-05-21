export type ScreenName = "login" | "signup" | "swipe" | "map" | "collections" | "filters";

export interface NativeRestaurant {
  id: string;
  name: string;
  address: string;
  distance: string;
  distanceNum: number;
  rating: number;
  reviews: number;
  price: string;
  isOpen: boolean;
  image: string;
  mapUrl: string;
}

export interface NativeFood {
  id: string;
  name: string;
  cuisine: string;
  description: string;
  image: string;
  calories: string;
  /** When set (e.g. map/API cards), shown in the stats pill instead of calorie-style copy */
  cardStats?: { emoji: string; text: string };
  tags: string[];
  dishType: string;
  restaurants: NativeRestaurant[];
}

export interface LikedFood {
  foodId: string;
  foodName: string;
  cuisine: string;
  likedAt: string;
  image: string;
  description?: string;
  tags?: string[];
  dishType?: string;
  calories?: string;
  cardStats?: NativeFood["cardStats"];
  restaurants?: NativeRestaurant[];
}

export interface UserPreferences {
  cuisines: string[];
  priceVndMin: number;
  priceVndMax: number;
  maxDistance: number;
  minRating: number;
}

export interface UserProfile {
  email: string;
  name: string;
}

export const CUISINE_OPTIONS = [
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
];

export const PRICE_BRACKETS = [
  { level: "$", min: 0, max: 50000 },
  { level: "$$", min: 50000, max: 150000 },
  { level: "$$$", min: 150000, max: 500000 },
  { level: "$$$$", min: 500000, max: Infinity },
] as const;

export function vndToPriceLevels(vndMin: number, vndMax: number): string[] {
  return PRICE_BRACKETS
    .filter((b) => b.min < vndMax && b.max > vndMin)
    .map((b) => b.level);
}

export function priceLevelsToVnd(levels: string[]): { vndMin: number; vndMax: number } {
  if (levels.length === 0) return { vndMin: 0, vndMax: 0 };
  if (levels.length >= 4) return { vndMin: 0, vndMax: 1000000 };
  const brackets = PRICE_BRACKETS.filter((b) => levels.includes(b.level));
  return {
    vndMin: Math.min(...brackets.map((b) => b.min)),
    vndMax: Math.max(...brackets.map((b) => (b.max === Infinity ? 1000000 : b.max))),
  };
}

export const defaultPreferences: UserPreferences = {
  cuisines: [],
  priceVndMin: 0,
  priceVndMax: 1000000,
  maxDistance: 5,
  minRating: 0,
};
