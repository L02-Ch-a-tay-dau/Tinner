export interface UserPreferences {
  cuisines: string[];
  dietaryRestrictions: string[];
  priceRange: string[];
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
          dietaryRestrictions: [],
          priceRange: ["$", "$$", "$$$", "$$$$"],
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
};
