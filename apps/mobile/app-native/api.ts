import * as Location from "expo-location";
import type { LikedFood, NativeFood, NativeRestaurant, UserPreferences, UserProfile } from "./types";
import { priceLevelsToVnd, vndToPriceLevels } from "./types";
import { formatDishTypeLabel } from "./dish-type-labels";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000";
const DEFAULT_COORDS = { latitude: 10.7769, longitude: 106.7009 };
const REQUEST_TIMEOUT_MS = 30_000;

interface ApiErrorBody {
  message?: unknown;
  details?: unknown;
  error?: unknown;
}

interface AuthResponseDto {
  tokens: {
    accessToken: string;
  };
  user: {
    email: string;
    fullName?: string | null;
    username?: string | null;
  };
}

interface RestaurantDto {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  rating: number | null;
  userRatingsTotal: number;
  priceLevel: number | null;
  dishTypes: string[];
  distanceKm?: number;
  placeUrl?: string | null;
  imageUrl?: string | null;
}

interface DishDto {
  id: string;
  name: string;
  imageUrl: string | null;
  description: string | null;
}

const PRICE_LABELS: Record<number, string> = { 1: "$", 2: "$$", 3: "$$$", 4: "$$$$" };
let cachedDishMap: Record<string, DishDto> | null = null;

function seededImage(seed: string) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/900/1200`;
}

function normalizeDishKey(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replaceAll(/[\u0300-\u036f]/g, "")
    .replaceAll("đ", "d")
    .trim()
    .replaceAll("_", " ")
    .replaceAll(/\s+/g, " ");
}

function buildDishMap(dishes: DishDto[]) {
  return dishes.reduce<Record<string, DishDto>>((acc, dish) => {
    acc[normalizeDishKey(dish.name)] = dish;
    return acc;
  }, {});
}

function toNativeRestaurant(restaurant: RestaurantDto, dishType: string): NativeRestaurant {
  const distanceNum = restaurant.distanceKm ?? 0;
  const price = restaurant.priceLevel ? PRICE_LABELS[restaurant.priceLevel] ?? "$$" : "$$";

  return {
    id: restaurant.id,
    name: restaurant.name,
    address: restaurant.address ?? restaurant.city ?? "Address unavailable",
    distance: `${distanceNum.toFixed(1)} km`,
    distanceNum,
    rating: restaurant.rating ?? 0,
    reviews: restaurant.userRatingsTotal ?? 0,
    price,
    isOpen: true,
    image: restaurant.imageUrl ?? seededImage(`${dishType}-${restaurant.id}-restaurant`),
    mapUrl: restaurant.placeUrl ?? "",
  };
}

export function toNativeFood(restaurant: RestaurantDto, dishType: string): NativeFood {
  const dishLabel = formatDishTypeLabel(dishType);
  const dish = cachedDishMap?.[normalizeDishKey(dishType)];
  const dishImage = dish?.imageUrl ?? null;
  const dishDescription = dish?.description ?? null;
  const nativeRestaurant = toNativeRestaurant(restaurant, dishType);
  const distanceNum = restaurant.distanceKm ?? 0;
  const km = `${distanceNum.toFixed(1)} km`;
  const ratingPart =
    restaurant.rating != null && restaurant.rating > 0 ? ` · ★${restaurant.rating.toFixed(1)}` : "";
  const addressLine = restaurant.address ?? restaurant.city ?? "";

  return {
    id: `${restaurant.id}-${dishType}`,
    name: restaurant.name,
    cuisine: dishLabel,
    description: dishDescription || (addressLine ? addressLine : `${dishLabel} ở gần bạn`),
    image: dishImage || restaurant.imageUrl || seededImage(`${dishType}-${restaurant.id}-food`),
    calories: addressLine || "Restaurant",
    cardStats: { emoji: "📍", text: `${km}${ratingPart}` },
    tags: [
      `#${dishLabel.replaceAll(/\s+/g, "")}`,
      ...(restaurant.dishTypes ?? []).slice(0, 2).map((tag) => `#${String(tag).replaceAll(/\s+/g, "")}`),
    ],
    dishType,
    restaurants: [nativeRestaurant],
  };
}

function normalizeApiErrorMessage(body: ApiErrorBody, status: number): string {
  if (Array.isArray(body.details)) {
    const details = body.details.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
    if (details.length > 0) {
      return details.join("\n");
    }
  }

  if (Array.isArray(body.message)) {
    const messages = body.message.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
    if (messages.length > 0) {
      return messages.join("\n");
    }
  }

  if (typeof body.message === "string" && body.message.trim().length > 0) {
    return body.message;
  }

  if (status === 401) {
    return "Tài khoản hoặc mật khẩu chưa đúng.";
  }
  if (status === 409) {
    return "Dữ liệu đã tồn tại. Vui lòng thử thông tin khác.";
  }
  if (status >= 500) {
    return "Lỗi máy chủ. Vui lòng thử lại sau.";
  }

  return `Yêu cầu thất bại`;
}

async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ApiErrorBody;
    return normalizeApiErrorMessage(body, response.status);
  } catch {
    // response body was not JSON (e.g., HTML error page or empty body)
  }
  return `Request failed with status ${response.status}`;
}

async function request<T>(path: string, token?: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers ?? undefined),
      },
    });

    if (!response.ok) {
      const message = await extractErrorMessage(response);
      throw new Error(message);
    }

    return (await response.json()) as T;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Yêu cầu quá thời gian chờ. Vui lòng kiểm tra kết nối và thử lại.");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function loginWithApi(email: string, password: string) {
  const response = await request<AuthResponseDto>("/api/v1/auth/login", undefined, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  const profile: UserProfile = {
    email: response.user.email,
    name: response.user.fullName || response.user.username || response.user.email,
  };

  return {
    token: response.tokens.accessToken,
    profile,
  };
}

export interface SignupInput {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName?: string;
}

export async function signupWithApi(input: SignupInput) {
  await request<AuthResponseDto>("/api/v1/auth/register", undefined, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getCurrentCoordinates() {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== "granted") {
    return { coords: DEFAULT_COORDS, usedFallback: true };
  }

  const location = await Location.getCurrentPositionAsync({});
  return {
    coords: {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    },
    usedFallback: false,
  };
}

function pickDishType(restaurant: RestaurantDto, fallback?: string): string {
  if (fallback) return fallback;
  const fromRestaurant = restaurant.dishTypes?.[0];
  return fromRestaurant ?? "restaurant";
}

export async function getSuggestionsFromApi(token: string, dishType?: string) {
  if (!cachedDishMap) {
    try {
      const dishes = await request<DishDto[]>("/api/v1/dishes", token);
      cachedDishMap = buildDishMap(dishes);
    } catch {
      cachedDishMap = {};
    }
  }

  const location = await getCurrentCoordinates();
  const params = new URLSearchParams({
    lat: String(location.coords.latitude),
    lng: String(location.coords.longitude),
  });
  if (dishType) {
    params.append("dishType", dishType);
  }
  const restaurants = await request<RestaurantDto[]>(`/api/v1/suggestions?${params.toString()}`, token);
  const cards = restaurants.map((restaurant) =>
    toNativeFood(restaurant, pickDishType(restaurant, dishType)),
  );

  return {
    cards,
    usedFallback: location.usedFallback,
  };
}

export async function saveRestaurantToApi(token: string, restaurantId: string, dishType: string) {
  await request<{ success: boolean }>("/api/v1/interactions/save", token, {
    method: "POST",
    body: JSON.stringify({ restaurantId, dishType }),
  });
}

export async function saveFiltersToApi(token: string, preferences: UserPreferences) {
  await request("/api/v1/filters", token, {
    method: "PUT",
    body: JSON.stringify({
      cuisines: preferences.cuisines,
      priceRanges: vndToPriceLevels(preferences.priceVndMin, preferences.priceVndMax),
      maxDistanceKm: preferences.maxDistance,
      minRating: preferences.minRating,
    }),
  });
}

interface SavedInteractionDto {
  interactionId: string;
  dishType: string;
  savedAt: string;
  restaurant: RestaurantDto;
}

export function mapSavedToLikedFoods(items: SavedInteractionDto[]): LikedFood[] {
  return items.map((item) => {
    const restaurant = item.restaurant;
    const dishType = item.dishType;
    const nativeRestaurant = toNativeRestaurant(restaurant, dishType);
    const nativeFood = toNativeFood(restaurant, dishType);
    return {
      foodId: `${restaurant.id}-${dishType}`,
      interactionId: item.interactionId,
      foodName: restaurant.name,
      cuisine: formatDishTypeLabel(dishType),
      likedAt: item.savedAt,
      image: nativeFood.image,
      description: nativeFood.description,
      tags: nativeFood.tags,
      dishType,
      calories: nativeFood.calories,
      cardStats: nativeFood.cardStats,
      restaurants: [nativeRestaurant],
    };
  });
}

export async function fetchSavedFromApi(token: string): Promise<LikedFood[]> {
  const items = await request<SavedInteractionDto[]>("/api/v1/interactions/saved", token);
  return mapSavedToLikedFoods(items);
}

export async function deleteSavedFromApi(token: string, interactionId: string) {
  await request<{ success: boolean }>(`/api/v1/interactions/saved/${interactionId}`, token, {
    method: "DELETE",
  });
}

export async function fetchMeFromApi(token: string): Promise<UserProfile> {
  const user = await request<{
    email: string;
    username: string;
    fullName: string | null;
  }>("/api/v1/auth/me", token);
  return {
    email: user.email,
    username: user.username,
    name: user.fullName || user.username || user.email,
  };
}

export async function loadFiltersFromApi(token: string): Promise<UserPreferences> {
  const response = await request<{
    cuisines: string[];
    priceRanges: string[];
    maxDistanceKm: number;
    minRating: number;
  }>("/api/v1/filters", token);
  const vnd = priceLevelsToVnd(response.priceRanges ?? ["$", "$$", "$$$", "$$$$"]);
  return {
    cuisines: response.cuisines ?? [],
    priceVndMin: vnd.vndMin,
    priceVndMax: vnd.vndMax,
    maxDistance: response.maxDistanceKm ?? 5,
    minRating: response.minRating ?? 0,
  };
}
