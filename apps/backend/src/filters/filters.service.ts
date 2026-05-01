import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateFiltersDto } from "./dto/update-filters.dto";

@Injectable()
export class FiltersService {
  constructor(private readonly prisma: PrismaService) {}

  async getFilters(userId: string) {
    const existing = await this.prisma.userFilter.findUnique({
      where: { userId },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.userFilter.create({
      data: {
        userId,
        priceRanges: ["$", "$$", "$$$", "$$$$"],
        maxDistanceKm: 5,
        minRating: 3,
      },
    });
  }

  async updateFilters(userId: string, dto: UpdateFiltersDto) {
    await this.getFilters(userId);
    return this.prisma.userFilter.update({
      where: { userId },
      data: {
        cuisines: dto.cuisines,
        dietary: dto.dietary,
        priceRanges: dto.priceRanges,
        maxDistanceKm: dto.maxDistanceKm,
        minRating: dto.minRating,
      },
    });
  }
}
