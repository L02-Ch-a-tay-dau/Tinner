import { Injectable } from "@nestjs/common";
import { DishType, Prisma } from "@prisma/client";
import { dishTypeToApiValue } from "../common/dish-type.util";
import { FiltersService } from "../filters/filters.service";
import { PrismaService } from "../prisma/prisma.service";
import { FoursquareService } from "./foursquare.service";

interface RestaurantWithDistance {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  latitude: number;
  longitude: number;
  rating: number | null;
  foursquareUrl: string | null;
  dishTypes: DishType[];
  distanceKm: number;
  hours: string | null;
}

@Injectable()
export class SuggestionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly filtersService: FiltersService,
    private readonly foursquareService: FoursquareService,
  ) {}

  async getSuggestions(userId: string, dishType: DishType, lat: number, lng: number) {
    const filters = await this.filtersService.getFilters(userId);
    const local = await this.searchLocalRestaurants(dishType, lat, lng, filters.maxDistanceKm, filters.minRating);

    if (local.length >= 10) {
      return local;
    }

    const foursquareResults = await this.foursquareService.searchByDishType(
      dishType,
      lat,
      lng,
      filters.maxDistanceKm * 1000,
    );

    for (const item of foursquareResults) {
      const latitude = item.latitude;
      const longitude = item.longitude;

      if (!item.fsq_place_id || !latitude || !longitude) {
        continue;
      }

      const address = item.location?.formatted_address || item.location?.address || null;
      const hoursDisplay = item.hours?.display ?? null;

      const currentDishTypes = [dishType];
      await this.prisma.restaurant.upsert({
        where: { foursquareId: item.fsq_place_id },
        update: {
          name: item.name,
          address,
          latitude,
          longitude,
          rating: (item.rating && item.rating > 0) ? item.rating / 2 : null, // Foursquare rating is out of 10, normalize to 5
          userRatingsTotal: item.stats?.total_ratings ?? 0,
          priceLevel: item.price ?? null,
          foursquareUrl: `https://foursquare.com/v/${item.fsq_place_id}`,
          dishTypes: currentDishTypes,
          lastSyncedAt: new Date(),
          hours: hoursDisplay,
        },
        create: {
          name: item.name,
          address,
          latitude,
          longitude,
          rating: (item.rating && item.rating > 0) ? item.rating / 2 : null,
          userRatingsTotal: item.stats?.total_ratings ?? 0,
          priceLevel: item.price ?? null,
          foursquareId: item.fsq_place_id,
          foursquareUrl: `https://foursquare.com/v/${item.fsq_place_id}`,
          dishTypes: currentDishTypes,
          hours: hoursDisplay,
        },
      });
    }

    return this.searchLocalRestaurants(dishType, lat, lng, filters.maxDistanceKm, filters.minRating);
  }

  private async searchLocalRestaurants(
    dishType: DishType,
    lat: number,
    lng: number,
    maxDistanceKm: number,
    minRating: number,
  ) {
    const where: Prisma.RestaurantWhereInput = {
      dishTypes: { has: dishType },
      OR: [{ rating: null }, { rating: { gte: minRating } }],
    };

    const restaurants = await this.prisma.restaurant.findMany({
      where,
      orderBy: [{ rating: "desc" }, { userRatingsTotal: "desc" }],
      take: 50,
    });

    const withDistance: RestaurantWithDistance[] = restaurants
      .map((restaurant) => ({
        ...restaurant,
        distanceKm: this.getDistanceKm(lat, lng, restaurant.latitude, restaurant.longitude),
      }))
      .filter((restaurant) => restaurant.distanceKm <= maxDistanceKm)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 20);

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
