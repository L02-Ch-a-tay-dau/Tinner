import { Injectable, Logger } from "@nestjs/common";
import { DishType } from "@prisma/client";
import { detectDishTypesInText } from "../common/dish-type.util";

const PRICE_TAG_MAP: Record<string, number> = {
  "1": 1, "2": 2, "3": 3, "4": 4,
  "$": 1, "$$": 2, "$$$": 3, "$$$$": 4,
  cheap: 1, moderate: 2, expensive: 3, very_expensive: 4,
};

function parsePriceLevel(tags: Record<string, string>): number | null {
  const raw = tags.charge ?? tags["price_level"] ?? tags.price ?? null;
  if (!raw) return null;
  const normalized = raw.trim().toLowerCase();
  return PRICE_TAG_MAP[normalized] ?? null;
}

export interface OverpassRestaurant {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  amenity: string | null;
  cuisine: string | null;
  dishTypes: DishType[];
  priceLevel: number | null;
  imageUrl: string | null;
  // Richer fields — populated by SerpAPI, null from Overpass
  rating?: number;
  userRatingsTotal?: number;
  phone?: string | null;
  hours?: string | null;
  city?: string | null;
  placeUrl?: string | null;
}

interface OverpassElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

const ENDPOINT = "https://overpass-api.de/api/interpreter";
const USER_AGENT = "food-swipe-app";
const MAX_RADIUS_METERS = 7000;
const TIMEOUT_SECONDS = 25;
const AMENITY_REGEX = "^(restaurant|fast_food|cafe|food_court)$";
const COOLDOWN_OK_MS = 10_000;
const COOLDOWN_RATE_LIMIT_MS = 60_000;

@Injectable()
export class OverpassService {
  private readonly logger = new Logger(OverpassService.name);
  private lastOkTime = 0;
  private lastRateLimitTime = 0;

  async fetchAround(lat: number, lng: number, radiusMeters: number = MAX_RADIUS_METERS): Promise<OverpassRestaurant[]> {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return [];
    }

    const now = Date.now();
    if (now - this.lastRateLimitTime < COOLDOWN_RATE_LIMIT_MS) {
      this.logger.verbose("Overpass rate-limit cooldown active, skipping fetch");
      return [];
    }
    if (now - this.lastOkTime < COOLDOWN_OK_MS) {
      this.logger.verbose("Overpass ok cooldown active, skipping fetch");
      return [];
    }

    const clampedRadius = Math.min(radiusMeters, MAX_RADIUS_METERS);
    const query = this.buildQuery(lat, lng, clampedRadius);
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "User-Agent": USER_AGENT,
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: new URLSearchParams({ data: query }).toString(),
      });

      if (!response.ok) {
        const text = await response.text();
        if (response.status === 429) {
          this.lastRateLimitTime = now;
          this.logger.warn("Overpass rate limited (429), backing off 60s");
        } else {
          this.logger.error(`Overpass request failed (${response.status}): ${text.slice(0, 200)}`);
        }
        return [];
      }

      const payload = (await response.json()) as OverpassResponse;
      this.lastOkTime = now;
      return this.mapElements(payload.elements ?? []);
    } catch (error) {
      this.logger.error(`Error calling Overpass for (${lat},${lng})`, error);
      return [];
    }
  }

  private buildQuery(lat: number, lng: number, radiusMeters: number): string {
    return `[out:json][timeout:${TIMEOUT_SECONDS}];
(
  node["amenity"~"${AMENITY_REGEX}"](around:${radiusMeters},${lat},${lng});
  way["amenity"~"${AMENITY_REGEX}"](around:${radiusMeters},${lat},${lng});
);
out center tags;`;
  }

  private mapElements(elements: OverpassElement[]): OverpassRestaurant[] {
    const seen = new Set<string>();
    const restaurants: OverpassRestaurant[] = [];

    for (const element of elements) {
      const coords = this.getCoords(element);
      const tags = element.tags ?? {};
      const name = tags.name?.trim();
      if (!coords || !name) {
        continue;
      }

      const placeId = `${element.type[0]}${element.id}`;
      if (seen.has(placeId)) {
        continue;
      }
      seen.add(placeId);

      const cuisine = tags.cuisine ?? null;
      const dishTypes = this.detectDishTypes(name, cuisine);
      const address = this.formatAddress(tags);
      const priceLevel = parsePriceLevel(tags);

      restaurants.push({
        id: placeId,
        name,
        latitude: coords.lat,
        longitude: coords.lng,
        address,
        amenity: tags.amenity ?? null,
        cuisine,
        dishTypes,
        priceLevel,
        imageUrl: null,
      });
    }

    return restaurants;
  }

  private getCoords(element: OverpassElement): { lat: number; lng: number } | null {
    if (element.lat != null && element.lon != null) {
      return { lat: element.lat, lng: element.lon };
    }
    if (element.center) {
      return { lat: element.center.lat, lng: element.center.lon };
    }
    return null;
  }

  private detectDishTypes(name: string, cuisine: string | null): DishType[] {
    const cuisineTokens = cuisine ? cuisine.split(/[;,]/).map((token) => token.trim()) : [];
    return detectDishTypesInText(name, ...cuisineTokens);
  }

  private formatAddress(tags: Record<string, string>): string {
    const parts = [
      tags["addr:housenumber"],
      tags["addr:street"],
      tags["addr:suburb"] ?? tags["addr:quarter"],
      tags["addr:district"] ?? tags["addr:city_district"],
      tags["addr:city"],
    ].filter((value): value is string => typeof value === "string" && value.trim().length > 0);

    if (parts.length > 0) {
      return parts.join(", ");
    }
    return tags["addr:full"]?.trim() ?? "";
  }
}
