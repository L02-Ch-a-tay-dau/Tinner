import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { dishTypeToApiValue } from "../common/dish-type.util";

@Injectable()
export class DishesService {
  constructor(private readonly prisma: PrismaService) {}

  async getDishes() {
    const dishes = await this.prisma.dish.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        description: true,
      },
    });
    return dishes.map((dish) => ({
      ...dish,
      name: dishTypeToApiValue(dish.name),
    }));
  }
}
