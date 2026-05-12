export const dishTypes = [
  "bun bo",
  "bun dau",
  "com ga",
  "com tam",
  "pho",
  "banh mi",
  "bun cha",
  "hu tieu",
  "banh xeo",
  "goi cuon",
  "mi quang",
  "bun rieu",
  "bun bo hue",
  "banh cuon",
  "banh canh",
  "banh beo",
] as const;

export type DishType = (typeof dishTypes)[number];

export type InteractionType = "LIKE_DISH" | "SAVE_RESTAURANT";

export interface UserDto {
  id: string;
  email: string;
  username: string;
  fullName?: string | null;
  role: string;
}

export interface TokensDto {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponseDto {
  user: UserDto;
  tokens: TokensDto;
}

export interface DishDto {
  id: string;
  name: DishType;
  imageUrl: string;
  description: string | null;
}

export interface RestaurantDto {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  latitude: number;
  longitude: number;
  placeId: string;
  placeUrl: string | null;
  phone: string | null;
  rating: number | null;
  userRatingsTotal: number;
  priceLevel: number | null;
  dishTypes: DishType[];
  hours: string | null;
}

export interface SavedRestaurantDto {
  interactionId: string;
  dishType: DishType;
  restaurant: RestaurantDto;
}

export interface UserFiltersDto {
  cuisines: string[];
  dietary: string[];
  priceRanges: string[];
  maxDistanceKm: number;
  minRating: number;
}
