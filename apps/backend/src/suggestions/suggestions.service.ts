import { Injectable, Logger } from "@nestjs/common";
import { DishType, Prisma } from "@prisma/client";
import { dishTypeToApiValue } from "../common/dish-type.util";
import { FiltersService } from "../filters/filters.service";
import { PrismaService } from "../prisma/prisma.service";
import { OverpassRestaurant, OverpassService } from "./overpass.service";

interface RestaurantWithDistance {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  latitude: number;
  longitude: number;
  rating: number | null;
  placeUrl: string | null;
  dishTypes: DishType[];
  distanceKm: number;
  hours: string | null;
}

const FRESHNESS_BBOX_DELTA = 0.07;
const FRESHNESS_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const FRESHNESS_MIN_COUNT = 20;

@Injectable()
export class SuggestionsService {
  private readonly logger = new Logger(SuggestionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly filtersService: FiltersService,
    private readonly overpassService: OverpassService,
  ) {}

  async getSuggestions(userId: string, lat: number, lng: number, dishType?: DishType) {
    const filters = await this.filtersService.getFilters(userId);

    const fresh = await this.isAreaFresh(lat, lng);
    if (!fresh) {
      const fetched = await this.overpassService.fetchAround(lat, lng);
      if (fetched.length > 0) {
        await this.bulkInsertRestaurants(fetched);
      }
    }

    if (dishType) {
      return this.searchLocalByDish(dishType, lat, lng, filters.maxDistanceKm, filters.minRating);
    }

    const merged = await this.searchLocalAny(lat, lng, filters.maxDistanceKm, filters.minRating);
    return this.shuffle(merged);
  }

  private async isAreaFresh(lat: number, lng: number): Promise<boolean> {
    const since = new Date(Date.now() - FRESHNESS_TTL_MS);
    const count = await this.prisma.restaurant.count({
      where: {
        latitude: { gte: lat - FRESHNESS_BBOX_DELTA, lte: lat + FRESHNESS_BBOX_DELTA },
        longitude: { gte: lng - FRESHNESS_BBOX_DELTA, lte: lng + FRESHNESS_BBOX_DELTA },
        lastSyncedAt: { gte: since },
      },
    });
    return count >= FRESHNESS_MIN_COUNT;
  }

  private async bulkInsertRestaurants(items: OverpassRestaurant[]) {
    try {
      const result = await this.prisma.restaurant.createMany({
        data: items.map((item) => ({
          placeId: item.id,
          name: item.name,
          address: item.address || null,
          latitude: item.latitude,
          longitude: item.longitude,
          placeUrl: `https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`,
          dishTypes: item.dishTypes,
        })),
        skipDuplicates: true,
      });
      this.logger.log(`Inserted ${result.count} new restaurants (out of ${items.length} fetched)`);
    } catch (error) {
      this.logger.error("Bulk insert failed", error);
    }
  }

  private shuffle<T>(items: T[]): T[] {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  private async searchLocalByDish(
    dishType: DishType,
    lat: number,
    lng: number,
    maxDistanceKm: number,
    minRating: number,
  ) {
    const where: Prisma.RestaurantWhereInput = {
      dishTypes: { has: dishType },
      OR: [{ rating: null }, { rating: { gte: minRating } }],
      ...this.bboxWhere(lat, lng, maxDistanceKm),
    };

    const restaurants = await this.prisma.restaurant.findMany({
      where,
      orderBy: [{ rating: "desc" }, { userRatingsTotal: "desc" }],
      take: 200,
    });

    return this.mapAndFilter(restaurants, lat, lng, maxDistanceKm, 30);
  }

  private async searchLocalAny(
    lat: number,
    lng: number,
    maxDistanceKm: number,
    minRating: number,
  ) {
    const where: Prisma.RestaurantWhereInput = {
      OR: [{ rating: null }, { rating: { gte: minRating } }],
      dishTypes: { isEmpty: false },
      ...this.bboxWhere(lat, lng, maxDistanceKm),
    };

    const restaurants = await this.prisma.restaurant.findMany({
      where,
      orderBy: [{ rating: "desc" }, { userRatingsTotal: "desc" }],
      take: 400,
    });

    return this.mapAndFilter(restaurants, lat, lng, maxDistanceKm, 60);
  }

  private bboxWhere(lat: number, lng: number, maxDistanceKm: number) {
    const deltaLat = maxDistanceKm / 111;
    const deltaLng = maxDistanceKm / (111 * Math.cos((lat * Math.PI) / 180));
    return {
      latitude: { gte: lat - deltaLat, lte: lat + deltaLat },
      longitude: { gte: lng - deltaLng, lte: lng + deltaLng },
    };
  }

  private mapAndFilter(
    restaurants: Array<{
      id: string;
      name: string;
      address: string | null;
      city: string | null;
      latitude: number;
      longitude: number;
      rating: number | null;
      placeUrl: string | null;
      dishTypes: DishType[];
      hours: string | null;
    }>,
    lat: number,
    lng: number,
    maxDistanceKm: number,
    limit: number,
  ) {
    const withDistance: RestaurantWithDistance[] = restaurants
      .map((restaurant) => ({
        ...restaurant,
        distanceKm: this.getDistanceKm(lat, lng, restaurant.latitude, restaurant.longitude),
      }))
      .filter((restaurant) => restaurant.distanceKm <= maxDistanceKm)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, limit);

    return withDistance.map((restaurant) => ({
      ...restaurant,
      dishTypes: restaurant.dishTypes.map(dishTypeToApiValue),
    }));
  }

  private getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const rad = (value: number) => (value * Math.PI) / 180;
    const earthRadiusKm = 6371;
    const dLat = rad(lat2 - lat1);
    const dLon = rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
  }
}
