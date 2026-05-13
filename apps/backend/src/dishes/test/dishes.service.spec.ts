import { Test, TestingModule } from "@nestjs/testing";
import { DishesService } from "../dishes.service";
import { PrismaService } from "../../prisma/prisma.service";
import { DishType } from "@prisma/client";

describe("DishesService", () => {
  let service: DishesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    dish: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DishesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<DishesService>(DishesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getDishes", () => {
    it("should return formatted dishes", async () => {
      const mockDishes = [
        { id: "1", name: "bun_bo_hue" as DishType, imageUrl: "url1", description: "desc1" },
        { id: "2", name: "banh_mi" as DishType, imageUrl: "url2", description: "desc2" },
      ];
      mockPrismaService.dish.findMany.mockResolvedValue(mockDishes);

      const result = await service.getDishes();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("bun bo hue");
      expect(result[1].name).toBe("banh mi");
      expect(prisma.dish.findMany).toHaveBeenCalled();
    });
  });
});
