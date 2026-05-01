import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DishType } from "@prisma/client";

interface FoursquareSearchResponse {
  results?: Array<{
    fsq_place_id: string;
    name: string;
    location?: {
      formatted_address?: string;
      address?: string;
    };
    latitude?: number;
    longitude?: number;
    rating?: number;
    stats?: {
      total_ratings?: number;
    };
    price?: number;
    hours?: {
      display?: string;
    };
  }>;
}

const FALLBACK_QUERY = "vietnamese restaurant";

@Injectable()
export class FoursquareService {
  private readonly logger = new Logger(FoursquareService.name);

  constructor(private readonly configService: ConfigService) {}

  async searchByDishType(
    dishType: DishType,
    lat: number,
    lng: number,
    radiusMeters: number,
  ) {
    const apiKey = this.configService.get<string>("FOURSQUARE_API_KEY");
    if (!apiKey) {
      this.logger.warn("FOURSQUARE_API_KEY is missing, skip Foursquare search");
      return [];
    }

    const dishText = dishType.replaceAll("_", " ");
    const queries = [dishText, `${dishText} vietnamese`, FALLBACK_QUERY];
    const seen = new Set<string>();
    const collected: NonNullable<FoursquareSearchResponse["results"]> = [];

    for (const query of queries) {
      const items = await this.searchPlaces(apiKey, query, lat, lng, radiusMeters);
      for (const item of items) {
        if (!item.fsq_place_id || seen.has(item.fsq_place_id)) {
          continue;
        }
        seen.add(item.fsq_place_id);
        collected.push(item);
      }

      if (collected.length >= 10) {
        break;
      }
    }

    return collected.slice(0, 20);
  }

  private async searchPlaces(apiKey: string, query: string, lat: number, lng: number, radiusMeters: number) {
    const params = new URLSearchParams({
      query,
      ll: `${lat},${lng}`,
      radius: String(Math.floor(radiusMeters)),
      fields: "fsq_place_id,name,location,latitude,longitude,hours,rating,stats,price",
      limit: "10",
    });

    const endpoint = `https://places-api.foursquare.com/places/search?${params.toString()}`;

    try {
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
          "X-Places-Api-Version": "2025-06-17",
        },
      });

      if (!response.ok) {
        this.logger.error(`Foursquare request failed (${query}): ${response.status}`);
        const text = await response.text();
        this.logger.error(`Foursquare error response (${query}): ${text}`);
        return [];
      }

      const payload = (await response.json()) as FoursquareSearchResponse;
      return payload.results ?? [];
    } catch (error) {
      this.logger.error(`Error calling Foursquare API for query "${query}"`, error);
      return [];
    }
  }
}
