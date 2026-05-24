const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000";
const TOKEN_KEY = "tinner_token";
const USER_KEY = "tinner_user";

interface AuthResponseDto {
  tokens: { accessToken: string };
  user: { email: string; fullName?: string | null; username?: string | null };
}

export interface RestaurantDto {
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

export interface SuggestionCard {
  id: string;
  name: string;
  cuisine: string;
  description: string;
  image: string;
  calories: string;
  cardStats: { emoji: string; text: string };
  tags: string[];
  dishType: string;
  restaurants: Array<{
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
  }>;
}

const PRICE_LABELS: Record<number, string> = { 1: "$", 2: "$$", 3: "$$$", 4: "$$$$" };

function seededImage(seed: string) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/900/1200`;
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): { email: string; name: string } | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function storeAuth(token: string, user: { email: string; name: string }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getStoredToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers as Record<string, string> ?? {}),
    },
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = await response.json() as { message?: string };
      if (body?.message) message = body.message;
    } catch { /* ignore */ }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export async function loginApi(email: string, password: string) {
  const data = await request<AuthResponseDto>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  storeAuth(data.tokens.accessToken, {
    email: data.user.email,
    name: data.user.fullName ?? data.user.username ?? data.user.email,
  });
  return data;
}

export async function signupApi(input: {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName?: string;
}) {
  await request("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function fetchSuggestions(dishType?: string): Promise<SuggestionCard[]> {
  const token = getStoredToken();
  if (!token) throw new Error("Not authenticated");

  // Get current position
  const coords = await new Promise<{ latitude: number; longitude: number }>((resolve) => {
    if (!navigator.geolocation) {
      resolve({ latitude: 10.7769, longitude: 106.7009 });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => resolve({ latitude: 10.7769, longitude: 106.7009 }),
      { timeout: 5000, enableHighAccuracy: false },
    );
  });

  const params = new URLSearchParams({
    lat: String(coords.latitude),
    lng: String(coords.longitude),
  });
  if (dishType) params.append("dishType", dishType);

  const restaurants = await request<RestaurantDto[]>(`/api/v1/suggestions?${params.toString()}`);

  return restaurants.map((restaurant) => toCard(restaurant));
}

function toCard(restaurant: RestaurantDto): SuggestionCard {
  const dishType = restaurant.dishTypes?.[0] ?? "restaurant";
  const distanceNum = restaurant.distanceKm ?? 0;
  const price = restaurant.priceLevel ? PRICE_LABELS[restaurant.priceLevel] ?? "$$" : "$$";
  const rating = restaurant.rating ?? 0;
  const address = restaurant.address ?? restaurant.city ?? "Address unavailable";

  return {
    id: `${restaurant.id}-${dishType}`,
    name: restaurant.name,
    cuisine: dishType,
    description: address || `${dishType} near you`,
    image: restaurant.imageUrl ?? seededImage(`${dishType}-${restaurant.id}-food`),
    calories: address || "Restaurant",
    cardStats: { emoji: "📍", text: `${distanceNum.toFixed(1)} km${rating > 0 ? ` · ★${rating.toFixed(1)}` : ""}` },
    tags: [
      `#${dishType.replaceAll(/\s+/g, "")}`,
      ...(restaurant.dishTypes ?? []).slice(0, 2).map((t) => `#${String(t).replaceAll(/\s+/g, "")}`),
    ],
    dishType,
    restaurants: [{
      id: restaurant.id,
      name: restaurant.name,
      address,
      distance: `${distanceNum.toFixed(1)} km`,
      distanceNum,
      rating,
      reviews: restaurant.userRatingsTotal ?? 0,
      price,
      isOpen: true,
      image: restaurant.imageUrl ?? seededImage(`${dishType}-${restaurant.id}-restaurant`),
      mapUrl: restaurant.placeUrl ?? "",
    }],
  };
}

export interface FilterPreferences {
  cuisines: string[];
  priceVndMin: number;
  priceVndMax: number;
  maxDistance: number;
  minRating: number;
}

export async function fetchFilters(): Promise<FilterPreferences> {
  const data = await request<{
    cuisines: string[];
    priceRanges: string[];
    maxDistanceKm: number;
    minRating: number;
  }>("/api/v1/filters");
  const vnd = priceLevelsToVnd(data.priceRanges ?? ["$", "$$", "$$$", "$$$$"]);
  return {
    cuisines: data.cuisines ?? [],
    priceVndMin: vnd.vndMin,
    priceVndMax: vnd.vndMax,
    maxDistance: data.maxDistanceKm ?? 5,
    minRating: data.minRating ?? 0,
  };
}

const PRICE_BRACKETS = [
  { level: "$", min: 0, max: 50000 },
  { level: "$$", min: 50000, max: 150000 },
  { level: "$$$", min: 150000, max: 500000 },
  { level: "$$$$", min: 500000, max: Infinity },
] as const;

function priceLevelsToVnd(levels: string[]): { vndMin: number; vndMax: number } {
  if (levels.length === 0) return { vndMin: 0, vndMax: 0 };
  if (levels.length >= 4) return { vndMin: 0, vndMax: 1000000 };
  const brackets = PRICE_BRACKETS.filter((b) => levels.includes(b.level));
  return {
    vndMin: Math.min(...brackets.map((b) => b.min)),
    vndMax: Math.max(...brackets.map((b) => (b.max === Infinity ? 1000000 : b.max))),
  };
}

function vndToPriceLevels(vndMin: number, vndMax: number): string[] {
  return PRICE_BRACKETS
    .filter((b) => b.min < vndMax && b.max > vndMin)
    .map((b) => b.level);
}

export async function saveFiltersApi(prefs: FilterPreferences) {
  await request("/api/v1/filters", {
    method: "PUT",
    body: JSON.stringify({
      cuisines: prefs.cuisines,
      priceRanges: vndToPriceLevels(prefs.priceVndMin, prefs.priceVndMax),
      maxDistanceKm: prefs.maxDistance,
      minRating: prefs.minRating,
    }),
  });
}

export async function saveRestaurantApi(restaurantId: string, dishType: string) {
  await request("/api/v1/interactions/save", {
    method: "POST",
    body: JSON.stringify({ restaurantId, dishType }),
  });
}

interface SavedItemDto {
  id: string;
  restaurantId: string;
  restaurantName: string;
  dishType: string;
  address: string;
  savedAt: string;
}

export interface SavedItem {
  id: string;
  name: string;
  cuisine: string;
  address: string;
  savedAt: string;
  image: string;
}

export async function fetchSaved(): Promise<SavedItem[]> {
  const items = await request<SavedItemDto[]>("/api/v1/interactions/saved");
  return items.map((item) => ({
    id: item.id,
    name: item.restaurantName,
    cuisine: item.dishType,
    address: item.address,
    savedAt: item.savedAt,
    image: seededImage(`saved-${item.restaurantId}`),
  }));
}

export async function deleteSavedApi(id: string) {
  await request(`/api/v1/interactions/saved/${id}`, { method: "DELETE" });
}
