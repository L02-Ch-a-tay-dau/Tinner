import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DishType } from "@prisma/client";
import { detectDishTypesInText } from "../common/dish-type.util";
import type { OverpassRestaurant } from "./overpass.service";

const ENDPOINT = "https://serpapi.com/search";
const COOLDOWN_OK_MS = 10_000;

// Google Places type → normalized cuisine tag for cuisine-category mapping
const GOOGLE_TYPE_TO_CUISINE: Record<string, string> = {
  vietnamese_restaurant: "vietnamese",
  street_food: "street_food",
  noodle_house: "noodle",
  pho_restaurant: "pho",
  rice_restaurant: "rice",
  seafood_restaurant: "seafood",
  hot_pot_restaurant: "hot_pot",
  barbecue_restaurant: "bbq",
  japanese_restaurant: "japanese",
  sushi_restaurant: "sushi",
  ramen_restaurant: "ramen",
  izakaya_restaurant: "izakaya",
  korean_restaurant: "korean",
  chinese_restaurant: "chinese",
  dim_sum_restaurant: "dim_sum",
  italian_restaurant: "italian",
  pizza_restaurant: "pizza",
  french_restaurant: "french",
  american_restaurant: "american",
  burger_restaurant: "burger",
  mexican_restaurant: "mexican",
  indian_restaurant: "indian",
  thai_restaurant: "thai",
  mediterranean_restaurant: "mediterranean",
  coffee_shop: "coffee_shop",
  cafe: "cafe",
  bubble_tea: "bubble_tea",
  bakery: "bakery",
  sandwich_shop: "sandwich",
  fast_food_restaurant: "fast_food",
  vegan_restaurant: "vegan",
  vegetarian_restaurant: "vegetarian",
};

// Allowed normalized cuisine tags — only keep actual food/drink places
const FOOD_SERVICE_TAGS = new Set([
  ...Object.values(GOOGLE_TYPE_TO_CUISINE),
  "restaurant",
  "bar",
  "ice_cream_shop",
  "food",
]);

const NON_FOOD_SERVICE_KEYWORDS = [
  "supplier",
  "producer",
  "manufacturer",
  "wholesale",
  "grocery",
  "supermarket",
  "convenience_store",
  "frozen_food",
] as const;

function isFoodService(type: string | null): boolean {
  if (!type) return false;
  const normalized = normalizeType(type);
  if (!normalized) return false;

  if (NON_FOOD_SERVICE_KEYWORDS.some((kw) => normalized.includes(kw))) {
    return false;
  }

  if (FOOD_SERVICE_TAGS.has(normalized)) return true;

  if (
    normalized.endsWith("_restaurant") ||
    normalized.includes("restaurant") ||
    normalized.includes("cafe") ||
    normalized.includes("coffee_shop") ||
    normalized.includes("tea") ||
    normalized.includes("bakery") ||
    normalized.includes("fast_food") ||
    normalized.includes("takeout")
  ) {
    return true;
  }

  return false;
}

// Google price_level: 0=free, 1=cheap, 2=moderate, 3=expensive, 4=very expensive
function normalizePriceLevel(price: unknown): number | null {
  if (typeof price === "number") {
    return Math.max(1, Math.min(4, Math.round(price)));
  }
  if (typeof price === "string") {
    const len = price.replace(/[^$]/g, "").length;
    if (len >= 1 && len <= 4) return len;
    const num = Number(price);
    if (Number.isFinite(num) && num >= 0 && num <= 4) return Math.max(1, num);
  }
  return null;
}

function normalizeType(type: string | null): string | null {
  if (!type) return null;
  const key = type
    .toLowerCase()
    .replaceAll(/[^a-z0-9\s/]/g, "")
    .trim()
    .replaceAll(/\s+/g, "_")
    .replaceAll("/", "_");
  return GOOGLE_TYPE_TO_CUISINE[key] ?? key;
}

interface SerpapiLocalResult {
  title?: string;
  place_id?: string;
  rating?: number;
  reviews?: number;
  price_level?: string | number;
  type?: string;
  address?: string;
  gps_coordinates?: { latitude: number; longitude: number };
  phone?: string;
  operating_hours?: Record<string, string>;
  website?: string;
  thumbnail?: string;
  place_url?: string;
}

@Injectable()
export class SerpapiService {
  private readonly logger = new Logger(SerpapiService.name);
  private readonly apiKey: string;
  private lastOkTime = 0;

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.get<string>("SERPAPI_API_KEY") ?? "";
  }

  get isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  /** Search queries that match real user behavior on Maps in Vietnam */
  private readonly searchQueries = [
    "restaurant",
    "nhà hàng",
    "quán ăn",
    "quán cơm",
    "quán phở",
    "cafe",
    "trà sữa",
  ];

  async searchNearby(lat: number, lng: number, radiusMeters: number): Promise<OverpassRestaurant[]> {
    if (!this.isConfigured) {
      this.logger.warn("SerpAPI key not configured, skipping fetch");
      return [];
    }

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return [];
    }

    const now = Date.now();
    if (now - this.lastOkTime < COOLDOWN_OK_MS) {
      this.logger.verbose("SerpAPI cooldown active, skipping fetch");
      return [];
    }

    const zoom = radiusMeters <= 3000 ? 15 : radiusMeters <= 6000 ? 14 : 13;

    try {
      // Run multiple search queries in parallel ("food" for restaurants + "cafe" for coffee shops)
      // and merge results deduplicated by place_id. This covers more types of places than
      // a single query, since Google's ranking varies per keyword.
      const allResults = await this.fetchMultiQuery(
        lat, lng, zoom, this.searchQueries,
      );

      this.lastOkTime = now;
      const typeCounts = allResults.reduce<Record<string, number>>((acc, r) => {
        const t = r.type ?? "(missing)";
        acc[t] = (acc[t] ?? 0) + 1;
        return acc;
      }, {});
      const filtered = allResults.filter((r) => isFoodService(r.type ?? null));
      this.logger.log(
        `SerpAPI returned ${allResults.length} unique results for (${lat},${lng})` +
        ` via [${this.searchQueries.join(", ")}]` +
        ` — kept ${filtered.length} food-service, dropped ${allResults.length - filtered.length}` +
        ` — types: ${JSON.stringify(typeCounts)}`,
      );
      return filtered.map((r) => this.toRestaurant(r));
    } catch (error) {
      this.logger.error(`Error calling SerpAPI for (${lat},${lng})`, error);
      return [];
    }
  }

  /** Run multiple queries in parallel, merge results deduplicated by place_id */
  private async fetchMultiQuery(
    lat: number,
    lng: number,
    zoom: number,
    queries: string[],
  ): Promise<SerpapiLocalResult[]> {
    const seen = new Set<string>();
    const all: SerpapiLocalResult[] = [];

    const results = await Promise.allSettled(
      queries.map((q) => this.fetchOnePage(lat, lng, zoom, q)),
    );

    for (const result of results) {
      if (result.status === "rejected") {
        this.logger.warn(`SerpAPI multi-query sub-task rejected: ${result.reason}`);
        continue;
      }
      for (const item of result.value) {
        const pid = item.place_id ?? `${item.title}_${item.gps_coordinates?.latitude}_${item.gps_coordinates?.longitude}`;
        if (!seen.has(pid)) {
          seen.add(pid);
          all.push(item);
        }
      }
    }

    return all;
  }

  /** Execute a single search query and return raw results */
  private async fetchOnePage(
    lat: number,
    lng: number,
    zoom: number,
    query: string,
  ): Promise<SerpapiLocalResult[]> {
    const params = new URLSearchParams({
      engine: "google_maps",
      type: "search",
      q: query,
      ll: `@${lat},${lng},${zoom}z`,
      nearby: "true",
      gl: "vn",
      hl: "en",
      api_key: this.apiKey,
    });

    const response = await fetch(`${ENDPOINT}?${params.toString()}`, {
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      const text = await response.text();
      this.logger.error(`SerpAPI query "${query}" failed (${response.status}): ${text.slice(0, 200)}`);
      return [];
    }

    const payload = (await response.json()) as {
      local_results?: SerpapiLocalResult[];
      error?: string;
    };

    if (payload.error) {
      this.logger.error(`SerpAPI query "${query}" error: ${payload.error}`);
      return [];
    }

    this.logger.log(`SerpAPI query "${query}": got ${payload.local_results?.length ?? 0} results`);
    return payload.local_results ?? [];
  }

  private toRestaurant(result: SerpapiLocalResult): OverpassRestaurant {
    const name = result.title?.trim() ?? "Unknown";
    const coords = result.gps_coordinates ?? { latitude: 0, longitude: 0 };
    const googleType = result.type ?? null;
    const cuisineTag = normalizeType(googleType);
    const dishTypes = detectDishTypesInText(name, googleType);

    return {
      id: result.place_id ?? `serpapi_${name}_${coords.latitude}_${coords.longitude}`,
      name,
      latitude: coords.latitude,
      longitude: coords.longitude,
      address: result.address ?? "Address unavailable",
      amenity: googleType,
      cuisine: cuisineTag,
      dishTypes,
      priceLevel: normalizePriceLevel(result.price_level),
      rating: result.rating ?? undefined,
      userRatingsTotal: result.reviews ?? undefined,
      phone: result.phone ?? null,
      hours: result.operating_hours ? this.formatHours(result.operating_hours) : null,
      city: null,
      imageUrl: result.thumbnail ?? null,
      placeUrl: result.place_url ?? null,
    };
  }

  private formatHours(hours: Record<string, string>): string {
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    return days
      .map((day) => {
        const val = hours[day] ?? hours[day.toLowerCase()] ?? null;
        return val ? `${day}: ${val}` : null;
      })
      .filter((v): v is string => v != null)
      .join("; ");
  }
}
