import { foods as sourceFoods } from "./foods";
import type { NativeFood, NativeRestaurant, UserPreferences } from "./types";

function toNativeRestaurant(restaurant: (typeof sourceFoods)[number]["restaurants"][number]): NativeRestaurant {
  return {
    id: String(restaurant.id),
    name: restaurant.name,
    address: restaurant.address,
    distance: restaurant.distance,
    distanceNum: restaurant.distanceNum,
    rating: restaurant.rating,
    reviews: restaurant.reviews,
    price: restaurant.price,
    isOpen: restaurant.isOpen,
    image: restaurant.image,
    mapUrl: restaurant.mapUrl,
  };
}

export function getDesignFoods(): NativeFood[] {
  return sourceFoods.map((food) => ({
    id: String(food.id),
    name: food.name,
    cuisine: food.cuisine,
    description: food.description,
    image: food.image,
    calories: food.calories,
    tags: food.tags,
    dishType: food.name.toLowerCase(),
    restaurants: food.restaurants.map(toNativeRestaurant),
  }));
}

export function filterFoodsByPreferences(foods: NativeFood[], preferences: UserPreferences) {
  return foods
    .filter((food) => preferences.cuisines.length === 0 || preferences.cuisines.includes(food.cuisine))
    .filter((food) => {
      if (preferences.dietaryRestrictions.length === 0) return true;
      return preferences.dietaryRestrictions.some((restriction) =>
        food.tags.some((tag) => tag.toLowerCase().includes(restriction.toLowerCase())),
      );
    })
    .map((food) => ({
      ...food,
      restaurants: food.restaurants.filter(
        (restaurant) =>
          preferences.priceRange.includes(restaurant.price) &&
          restaurant.rating >= preferences.minRating &&
          restaurant.distanceNum <= preferences.maxDistance,
      ),
    }))
    .filter((food) => food.restaurants.length > 0);
}

export function getAllDesignRestaurants(foods: NativeFood[]) {
  return foods.flatMap((food) =>
    food.restaurants.map((restaurant) => ({
      ...restaurant,
      foodName: food.name,
      cuisine: food.cuisine,
    })),
  );
}
