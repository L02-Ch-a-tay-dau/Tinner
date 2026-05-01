import type {
  AuthResponseDto,
  DishDto,
  DishType,
  RestaurantDto,
  SavedRestaurantDto,
  UserDto,
  UserFiltersDto,
} from "@tinner/types";

export interface ApiClientOptions {
  baseUrl: string;
  getAccessToken?: () => string | null | Promise<string | null>;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName?: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UpdateFiltersPayload {
  cuisines?: string[];
  dietary?: string[];
  priceRanges?: string[];
  maxDistanceKm?: number;
  minRating?: number;
}

export interface SuggestionsQuery {
  dishType: DishType | string;
  lat: number;
  lng: number;
}

interface ApiErrorResponse {
  details?: string[];
  message?: string | string[];
}

function getApiErrorMessage(text: string, status: number) {
  if (!text) {
    return `Request failed with status ${status}`;
  }

  try {
    const payload = JSON.parse(text) as ApiErrorResponse;
    if (payload.details?.length) {
      return payload.details[0];
    }
    if (Array.isArray(payload.message) && payload.message.length) {
      return payload.message.join("\n");
    }
    if (typeof payload.message === "string" && payload.message) {
      return payload.message;
    }
  } catch {
    return text;
  }

  return `Request failed with status ${status}`;
}

export class ApiClient {
  constructor(private readonly options: ApiClientOptions) {}

  private async request<T>(path: string, init?: RequestInit, timeoutMs = 10000): Promise<T> {
    const token = this.options.getAccessToken
      ? await this.options.getAccessToken()
      : null;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${this.options.baseUrl}${path}`, {
        ...init,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(init?.headers ?? {}),
        },
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(getApiErrorMessage(text, response.status));
      }
      if (response.status === 204) {
        return null as T;
      }
      return (await response.json()) as T;
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        throw new Error("Request timed out. Check your network and API URL.");
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  register(payload: RegisterPayload) {
    return this.request<AuthResponseDto>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  login(payload: LoginPayload) {
    return this.request<AuthResponseDto>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  me() {
    return this.request<UserDto>("/api/v1/auth/me");
  }

  refresh(refreshToken: string) {
    return this.request<AuthResponseDto>("/api/v1/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  }

  logout(refreshToken: string) {
    return this.request<{ success: boolean }>("/api/v1/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  }

  getDishes() {
    return this.request<DishDto[]>("/api/v1/dishes");
  }

  likeDish(dishType: DishType | string) {
    return this.request<{ success: boolean }>("/api/v1/interactions/like", {
      method: "POST",
      body: JSON.stringify({ dishType }),
    });
  }

  saveRestaurant(restaurantId: string, dishType: DishType | string) {
    return this.request<{ success: boolean }>("/api/v1/interactions/save", {
      method: "POST",
      body: JSON.stringify({ restaurantId, dishType }),
    });
  }

  getSavedRestaurants() {
    return this.request<SavedRestaurantDto[]>("/api/v1/interactions/saved");
  }

  deleteSavedRestaurant(interactionId: string) {
    return this.request<null>(`/api/v1/interactions/saved/${interactionId}`, {
      method: "DELETE",
    });
  }

  getFilters() {
    return this.request<UserFiltersDto>("/api/v1/filters");
  }

  updateFilters(payload: UpdateFiltersPayload) {
    return this.request<UserFiltersDto>("/api/v1/filters", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  getSuggestions(query: SuggestionsQuery) {
    const params = new URLSearchParams({
      dishType: query.dishType,
      lat: String(query.lat),
      lng: String(query.lng),
    });
    return this.request<Array<RestaurantDto & { distanceKm?: number }>>(
      `/api/v1/suggestions?${params.toString()}`,
    );
  }
}
