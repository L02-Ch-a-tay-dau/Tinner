import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { dishTypeToApiValue } from "../common/dish-type.util";
import { LikeDishDto } from "./dto/like-dish.dto";
import { SaveRestaurantDto } from "./dto/save-restaurant.dto";

@Injectable()
export class InteractionsService {
  constructor(private readonly prisma: PrismaService) {}

  async likeDish(userId: string, dto: LikeDishDto) {
    const existing = await this.prisma.userInteraction.findFirst({
      where: {
        userId,
        dishType: dto.dishType,
        interactionType: "LIKE_DISH",
        restaurantId: null,
      },
    });
    if (!existing) {
      await this.prisma.userInteraction.create({
        data: {
          userId,
          dishType: dto.dishType,
          interactionType: "LIKE_DISH",
        },
      });
    }

    return { success: true };
  }

  async saveRestaurant(userId: string, dto: SaveRestaurantDto) {
    await this.ensureRestaurantExists(dto.restaurantId);
    await this.prisma.userInteraction.upsert({
      where: {
        userId_dishType_restaurantId_interactionType: {
          userId,
          dishType: dto.dishType,
          restaurantId: dto.restaurantId,
          interactionType: "SAVE_RESTAURANT",
        },
      },
      update: {},
      create: {
        userId,
        dishType: dto.dishType,
        restaurantId: dto.restaurantId,
        interactionType: "SAVE_RESTAURANT",
      },
    });
    return { success: true };
  }

  async getSaved(userId: string) {
    const interactions = await this.prisma.userInteraction.findMany({
      where: {
        userId,
        interactionType: "SAVE_RESTAURANT",
      },
      include: {
        restaurant: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return interactions
      .filter((item) => item.restaurant)
      .map((item) => ({
        interactionId: item.id,
        dishType: dishTypeToApiValue(item.dishType),
        restaurant: {
          ...item.restaurant,
          dishTypes: item.restaurant?.dishTypes.map(dishTypeToApiValue),
        },
      }));
  }

  async deleteSaved(userId: string, interactionId: string) {
    const existing = await this.prisma.userInteraction.findFirst({
      where: {
        id: interactionId,
        userId,
        interactionType: "SAVE_RESTAURANT",
      },
    });
    if (!existing) {
      throw new NotFoundException("Saved interaction not found");
    }

    await this.prisma.userInteraction.delete({
      where: { id: interactionId },
    });
  }

  private async ensureRestaurantExists(restaurantId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });
    if (!restaurant) {
      throw new NotFoundException("Restaurant not found");
    }
  }
}
