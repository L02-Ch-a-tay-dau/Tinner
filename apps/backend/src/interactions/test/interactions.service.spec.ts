import { Test, TestingModule } from "@nestjs/testing";
import { InteractionsService } from "../interactions.service";
import { PrismaService } from "../../prisma/prisma.service";
import { NotFoundException } from "@nestjs/common";
import { DishType } from "@prisma/client";

describe("InteractionsService", () => {
  let service: InteractionsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    userInteraction: {
      findFirst: jest.fn(),
      create: jest.fn(),
      upsert: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
    restaurant: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InteractionsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<InteractionsService>(InteractionsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe("likeDish", () => {
    const dto = { dishType: "pho" as DishType };

    it("should create interaction if it does not exist", async () => {
      mockPrismaService.userInteraction.findFirst.mockResolvedValue(null);
      await service.likeDish("u1", dto);
      expect(prisma.userInteraction.create).toHaveBeenCalled();
    });

    it("should not create interaction if it already exists", async () => {
      mockPrismaService.userInteraction.findFirst.mockResolvedValue({ id: "i1" });
      await service.likeDish("u1", dto);
      expect(prisma.userInteraction.create).not.toHaveBeenCalled();
    });
  });

  describe("saveRestaurant", () => {
    const dto = { dishType: "pho" as DishType, restaurantId: "r1" };

    it("should throw NotFoundException if restaurant does not exist", async () => {
      mockPrismaService.restaurant.findUnique.mockResolvedValue(null);
      await expect(service.saveRestaurant("u1", dto)).rejects.toThrow(NotFoundException);
    });

    it("should upsert interaction if restaurant exists", async () => {
      mockPrismaService.restaurant.findUnique.mockResolvedValue({ id: "r1" });
      await service.saveRestaurant("u1", dto);
      expect(prisma.userInteraction.upsert).toHaveBeenCalled();
    });
  });

  describe("getSaved", () => {
    it("should return formatted saved interactions and filter out items without restaurants", async () => {
      const mockInteractions = [
        {
          id: "i1",
          dishType: "pho" as DishType,
          createdAt: new Date("2026-05-25T08:00:00.000Z"),
          restaurant: { id: "r1", name: "Restaurant 1", dishTypes: ["pho"] },
        },
        {
          id: "i2",
          dishType: "banh_mi" as DishType,
          createdAt: new Date("2026-05-25T09:00:00.000Z"),
          restaurant: null, // Should be filtered out
        },
      ];
      mockPrismaService.userInteraction.findMany.mockResolvedValue(mockInteractions);

      const result = await service.getSaved("u1");
      expect(result).toHaveLength(1);
      expect(result[0].interactionId).toBe("i1");
      expect(result[0].restaurant.name).toBe("Restaurant 1");
    });
  });

  describe("deleteSaved", () => {
    it("should throw NotFoundException if interaction not found", async () => {
      mockPrismaService.userInteraction.findFirst.mockResolvedValue(null);
      await expect(service.deleteSaved("u1", "i1")).rejects.toThrow(NotFoundException);
    });

    it("should delete if interaction found", async () => {
      mockPrismaService.userInteraction.findFirst.mockResolvedValue({ id: "i1" });
      await service.deleteSaved("u1", "i1");
      expect(prisma.userInteraction.delete).toHaveBeenCalledWith({ where: { id: "i1" } });
    });
  });
});
