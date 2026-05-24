import { Injectable, Logger } from "@nestjs/common";
import { DishType, Prisma } from "@prisma/client";
import { categorizeCuisine, CUISINE_CATEGORIES, type CuisineCategory } from "../common/cuisine-category.util";
import { dishTypeToApiValue } from "../common/dish-type.util";
import { FiltersService } from "../filters/filters.service";
import { PrismaService } from "../prisma/prisma.service";
import { OverpassRestaurant } from "./overpass.service";
import { SerpapiService } from "./serpapi.service";

const PRICE_LEVEL_MAP: Record<string, number> = { $: 1, $$: 2, $$$: 3, $$$$: 4 };

const CUISINE_FILTER_ALIASES: Record<string, CuisineCategory[]> = {
  "Đồ Nhật": ["Đồ ăn Nhật Bản"],
  "Đồ Hàn": ["Đồ ăn Hàn Quốc"],
  "Đồ Hoa": ["Đồ ăn Trung Hoa"],
  "Đồ Âu": ["Đồ ăn Âu"],
  "Đồ uống & Cafe": ["Cafe", "Trà sữa"],
  "Bánh mì & Ăn nhanh": ["Bánh mì", "Gà rán", "Pizza"],
};

export interface RestaurantWithDistance {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  latitude: number;
  longitude: number;
  rating: number | null;
  placeUrl: string | null;
  imageUrl: string | null;
  dishTypes: string[];
  distanceKm: number;
  hours: string | null;
  priceLevel: number | null;
  cuisineCategory: CuisineCategory;
}

const restaurantSelect = {
  id: true,
  name: true,
  address: true,
  city: true,
  latitude: true,
  longitude: true,
  rating: true,
  placeUrl: true,
  imageUrl: true,
  dishTypes: true,
  hours: true,
  priceLevel: true,
  cuisineTag: true,
} as const satisfies Record<string, true>;

@Injectable()
export class SuggestionsService {
  private readonly logger = new Logger(SuggestionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly filtersService: FiltersService,
    private readonly serpapiService: SerpapiService,
  ) {}

  async getSuggestions(userId: string, lat: number, lng: number, dishType?: DishType) {
    const filters = await this.filtersService.getFilters(userId);

    // Luôn thử SerpAPI trước — dữ liệu chi tiết hơn (rating, review, price, hours)
    // Cooldown nội bộ (10s) bảo vệ khỏi spam API
    const fetched = await this.serpapiService.searchNearby(lat, lng, filters.maxDistanceKm * 1000);
    if (fetched.length > 0) {
      await this.bulkInsertRestaurants(fetched);
    }

    let results: RestaurantWithDistance[];
    if (dishType) {
      results = await this.searchLocalByDish(dishType, lat, lng, filters.maxDistanceKm, filters.minRating);
    } else {
      results = await this.searchLocalAny(lat, lng, filters.maxDistanceKm, filters.minRating);
      results = this.shuffle(results);
    }

    results = this.applyCuisineFilter(results, filters.cuisines as string[]);
    results = this.applyPriceFilter(results, filters.priceRanges as string[]);

    return results;
  }

  private applyCuisineFilter(results: RestaurantWithDistance[], selectedCuisines: string[]): RestaurantWithDistance[] {
    if (!selectedCuisines || selectedCuisines.length === 0 || selectedCuisines.length === CUISINE_CATEGORIES.length) {
      return results;
    }

    const expandedSelected = new Set<CuisineCategory>();
    for (const selected of selectedCuisines) {
      const asCategory = selected as CuisineCategory;
      if (CUISINE_CATEGORIES.includes(asCategory)) {
        expandedSelected.add(asCategory);
        continue;
      }

      const aliases = CUISINE_FILTER_ALIASES[selected];
      if (aliases) {
        for (const alias of aliases) expandedSelected.add(alias);
      }
    }

    if (expandedSelected.size === 0) return results;
    return results.filter((r) => expandedSelected.has(r.cuisineCategory));
  }

  private applyPriceFilter(results: RestaurantWithDistance[], selectedRanges: string[]): RestaurantWithDistance[] {
    if (!selectedRanges || selectedRanges.length === 0 || selectedRanges.length === 4) {
      return results;
    }
    const levels = selectedRanges.map((r) => PRICE_LEVEL_MAP[r]).filter((l): l is number => l != null);
    return results.filter((r) => r.priceLevel == null || levels.includes(r.priceLevel));
  }

  private async bulkInsertRestaurants(items: OverpassRestaurant[]) {
    try {
      const result = await this.prisma.restaurant.createMany({
        data: items.map((item) => ({
          placeId: item.id,
          name: item.name,
          address: item.address || null,
          city: item.city ?? null,
          latitude: item.latitude,
          longitude: item.longitude,
          rating: item.rating ?? null,
          userRatingsTotal: item.userRatingsTotal ?? 0,
          hours: item.hours ?? null,
          phone: item.phone ?? null,
          placeUrl: item.placeUrl ?? `https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`,
          imageUrl: item.imageUrl ?? null,
          dishTypes: item.dishTypes,
          cuisineTag: item.cuisine,
          priceLevel: item.priceLevel,
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
      select: restaurantSelect,
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
      ...this.bboxWhere(lat, lng, maxDistanceKm),
    };

    const restaurants = await this.prisma.restaurant.findMany({
      where,
      orderBy: [{ rating: "desc" }, { userRatingsTotal: "desc" }],
      select: restaurantSelect,
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
      imageUrl: string | null;
      dishTypes: DishType[];
      hours: string | null;
      priceLevel: number | null;
      cuisineTag: string | null;
    }>,
    lat: number,
    lng: number,
    maxDistanceKm: number,
    limit: number,
  ) {
    const withDistance: RestaurantWithDistance[] = restaurants
      .map((restaurant) => ({
        id: restaurant.id,
        name: restaurant.name,
        address: restaurant.address,
        city: restaurant.city,
        latitude: restaurant.latitude,
        longitude: restaurant.longitude,
        rating: restaurant.rating,
        placeUrl: restaurant.placeUrl,
        imageUrl: restaurant.imageUrl,
        dishTypes: restaurant.dishTypes,
        hours: restaurant.hours,
        priceLevel: restaurant.priceLevel,
        cuisineCategory: categorizeCuisine(restaurant.cuisineTag ?? restaurant.dishTypes[0] ?? null),
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
