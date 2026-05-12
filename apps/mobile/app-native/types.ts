export const GUEST_USER_EMAIL = "guest@tinner.app";

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
  dietaryRestrictions: string[];
  priceRange: string[];
  maxDistance: number;
  minRating: number;
}

export interface UserProfile {
  email: string;
  name: string;
}

export const defaultPreferences: UserPreferences = {
  cuisines: [],
  dietaryRestrictions: [],
  priceRange: ["$", "$$", "$$$", "$$$$"],
  maxDistance: 5,
  minRating: 0,
};
