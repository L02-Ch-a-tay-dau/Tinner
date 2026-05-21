import { fetchFilters, saveFiltersApi } from "./api";
import { getStoredToken } from "./api";

const PRICE_BRACKETS = [
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

export interface UserPreferences {
  cuisines: string[];
  priceVndMin: number;
  priceVndMax: number;
  maxDistance: number;
  minRating: number;
}

export interface LikedFood {
  foodId: number;
  foodName: string;
  cuisine: string;
  likedAt: string;
  image: string;
}

const PREFERENCES_KEY = "foodswipe_preferences";
const LIKED_FOODS_KEY = "foodswipe_liked_foods";

export const preferencesService = {
  getPreferences: (): UserPreferences => {
    const prefs = localStorage.getItem(PREFERENCES_KEY);
    return prefs
      ? JSON.parse(prefs)
      : {
          cuisines: [],
          priceVndMin: 0,
          priceVndMax: 1000000,
          maxDistance: 5,
          minRating: 0,
        };
  },

  savePreferences: (prefs: UserPreferences) => {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
  },

  getLikedFoods: (): LikedFood[] => {
    const liked = localStorage.getItem(LIKED_FOODS_KEY);
    return liked ? JSON.parse(liked) : [];
  },

  addLikedFood: (food: LikedFood) => {
    const liked = preferencesService.getLikedFoods();
    const exists = liked.some((f) => f.foodId === food.foodId);
    if (!exists) {
      liked.push(food);
      localStorage.setItem(LIKED_FOODS_KEY, JSON.stringify(liked));
    }
  },

  removeLikedFood: (foodId: number) => {
    const liked = preferencesService.getLikedFoods();
    const filtered = liked.filter((f) => f.foodId !== foodId);
    localStorage.setItem(LIKED_FOODS_KEY, JSON.stringify(filtered));
  },

  clearLikedFoods: () => {
    localStorage.setItem(LIKED_FOODS_KEY, JSON.stringify([]));
  },

  // API-backed load: tries API first, falls back to localStorage
  loadFromApi: async (): Promise<UserPreferences | null> => {
    if (!getStoredToken()) return null;
    try {
      return await fetchFilters();
    } catch {
      return preferencesService.getPreferences();
    }
  },

  // API-backed save: saves to API if authenticated, always saves locally
  saveToApi: async (prefs: UserPreferences): Promise<void> => {
    preferencesService.savePreferences(prefs);
    if (!getStoredToken()) return;
    try {
      await saveFiltersApi(prefs);
    } catch {
      // API save failed, local save still available
    }
  },
};
